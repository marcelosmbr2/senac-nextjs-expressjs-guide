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
import type { Category } from "@/types"

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})
type CategoryForm = z.infer<typeof categorySchema>

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isLoading } } =
    useForm<CategoryForm>({ resolver: zodResolver(categorySchema) })

  useEffect(() => {
    api.get<Category[]>("/categories").then(({ data }) => {
      const cat = data.find((c) => c.id === id)
      if (!cat) {
        toast.error("Categoria não encontrada.")
        router.push("/admin/categories")
        return
      }
      reset({ name: cat.name, description: cat.description ?? "" })
    }).catch(() => {
      toast.error("Erro ao carregar categoria.")
      router.push("/admin/categories")
    })
  }, [id, reset, router])

  async function onSubmit(data: CategoryForm) {
    try {
      await api.put(`/categories/${id}`, data)
      toast.success("Categoria atualizada com sucesso!")
      router.push("/admin/categories")
    } catch {
      toast.error("Erro ao atualizar categoria.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full max-w-md rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Editar Categoria</h1>
      </div>

      <Card className="max-w-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input id="description" {...register("description")} />
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
