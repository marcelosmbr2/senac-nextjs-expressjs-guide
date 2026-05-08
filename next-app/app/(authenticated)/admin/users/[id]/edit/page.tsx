"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import dayjs from "dayjs"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import type { User } from "@/types"

const updateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().optional(),
  role: z.enum(["admin", "customer"]),
  cnhNumber: z.string().min(1, "CNH é obrigatória"),
  cnhExpiry: z.string().min(1, "Validade é obrigatória"),
})
type UpdateForm = z.infer<typeof updateSchema>

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [loaded, setLoaded] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<UpdateForm>({ resolver: zodResolver(updateSchema) })

  useEffect(() => {
    api.get<User>(`/users/${id}`).then(({ data: user }) => {
      reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        cnhNumber: user.cnhNumber,
        cnhExpiry: dayjs(user.cnhExpiry).format("YYYY-MM-DD"),
      })
      setLoaded(true)
    }).catch(() => {
      toast.error("Usuário não encontrado.")
      router.push("/admin/users")
    })
  }, [id, reset, router])

  async function onSubmit(data: UpdateForm) {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role,
        cnhNumber: data.cnhNumber,
        cnhExpiry: new Date(data.cnhExpiry).toISOString(),
        ...(data.password ? { password: data.password } : {}),
      }
      await api.put(`/users/${id}`, payload)
      toast.success("Usuário atualizado com sucesso!")
      router.push("/admin/users")
    } catch {
      toast.error("Erro ao atualizar usuário.")
    }
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full max-w-lg rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Editar Usuário</h1>
      </div>

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Nova senha (opcional)</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="cnhNumber">Número da CNH</Label>
              <Input id="cnhNumber" {...register("cnhNumber")} />
              {errors.cnhNumber && <p className="text-xs text-destructive">{errors.cnhNumber.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="cnhExpiry">Validade da CNH</Label>
              <Input id="cnhExpiry" type="date" {...register("cnhExpiry")} />
              {errors.cnhExpiry && <p className="text-xs text-destructive">{errors.cnhExpiry.message}</p>}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
