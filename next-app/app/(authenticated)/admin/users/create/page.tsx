"use client"

import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser } from "../actions"

const createSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["admin", "customer"]),
  cnhNumber: z.string().min(1, "CNH é obrigatória"),
  cnhExpiry: z.string().min(1, "Validade é obrigatória"),
})
type CreateForm = z.infer<typeof createSchema>

export default function CreateUserPage() {
  const router = useRouter()
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<CreateForm>({
      resolver: zodResolver(createSchema),
      defaultValues: { role: "customer" },
    })

  async function onSubmit(data: CreateForm) {
    try {
      await createUser(data)
      toast.success("Usuário criado com sucesso!")
      router.push("/admin/users")
    } catch {
      toast.error("Erro ao criar usuário.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Novo Usuário</h1>
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
              <Label htmlFor="password">Senha</Label>
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
