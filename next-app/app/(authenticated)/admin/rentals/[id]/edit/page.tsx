"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import dayjs from "dayjs"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import type { Rental } from "@/types"

const updateSchema = z.object({
  totalDays: z.number().int().min(1, "Mínimo 1 dia").max(30, "Máximo 30 dias"),
})
type UpdateForm = z.infer<typeof updateSchema>

export default function EditRentalPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [rental, setRental] = useState<Rental | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<UpdateForm>({ resolver: zodResolver(updateSchema) })

  useEffect(() => {
    api.get<Rental[]>("/rentals").then(({ data }) => {
      const found = data.find((r) => r.id === id)
      if (!found) {
        toast.error("Locação não encontrada.")
        router.push("/admin/rentals")
        return
      }
      setRental(found)
      reset({ totalDays: found.totalDays })
    }).catch(() => {
      toast.error("Erro ao carregar locação.")
      router.push("/admin/rentals")
    })
  }, [id, reset, router])

  async function onSubmit(data: UpdateForm) {
    try {
      await api.put(`/rentals/${id}`, data)
      toast.success("Locação atualizada com sucesso!")
      router.push("/admin/rentals")
    } catch {
      toast.error("Erro ao atualizar locação.")
    }
  }

  if (!rental) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-md rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Editar Locação #{rental.id}</h1>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <Card>
          <CardContent className="pt-4 text-sm flex flex-col gap-2">
            <p><span className="text-muted-foreground">Cliente:</span> <strong>{rental.user?.name}</strong></p>
            <p>
              <span className="text-muted-foreground">Veículo:</span>{" "}
              <strong>{rental.vehicle?.model}</strong>{" "}
              <span className="font-mono text-muted-foreground">({rental.vehicle?.plate})</span>
            </p>
            <p>
              <span className="text-muted-foreground">Início:</span>{" "}
              {dayjs(rental.startDate).format("DD/MM/YYYY")}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={rental.isActive ? "default" : "secondary"}>
                {rental.isActive ? "Ativa" : "Finalizada"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="totalDays">Total de dias (1–30)</Label>
                <Input id="totalDays" type="number" min={1} max={30} {...register("totalDays", { valueAsNumber: true })} />
                {errors.totalDays && (
                  <p className="text-xs text-destructive">{errors.totalDays.message}</p>
                )}
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
    </div>
  )
}
