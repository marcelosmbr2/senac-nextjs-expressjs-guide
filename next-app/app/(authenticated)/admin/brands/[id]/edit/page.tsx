"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import type { Brand } from "@/types"

const brandSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
})
type BrandForm = z.infer<typeof brandSchema>

export default function EditBrandPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isLoading } } =
    useForm<BrandForm>({ resolver: zodResolver(brandSchema) })

  useEffect(() => {
    api.get<Brand[]>("/brands").then(({ data }) => {
      const brand = data.find((b) => b.id === id)
      if (!brand) {
        toast.error("Marca não encontrada.")
        router.push("/admin/brands")
        return
      }
      reset({ name: brand.name })
    }).catch(() => {
      toast.error("Erro ao carregar marca.")
      router.push("/admin/brands")
    })
  }, [id, reset, router])

  async function onSubmit(data: BrandForm) {
    try {
      await api.put(`/brands/${id}`, data)
      toast.success("Marca atualizada com sucesso!")
      router.push("/admin/brands")
    } catch {
      toast.error("Erro ao atualizar marca.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full max-w-md rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Editar Marca</h1>
      </div>

      <Card className="max-w-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
