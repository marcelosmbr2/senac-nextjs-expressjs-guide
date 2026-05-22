"use client"

import { useEffect, useState } from "react"
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
import api from "@/lib/axios"
import type { Brand, Category } from "@/types"
import { createVehicle } from "../actions"

const vehicleSchema = z.object({
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.number().min(1900, "Ano inválido"),
  plate: z.string().min(1, "Placa é obrigatória"),
  color: z.string().min(1, "Cor é obrigatória"),
  dailyRate: z.number().positive("Deve ser positivo"),
  description: z.string().optional(),
  brandId: z.number().min(1, "Selecione a marca"),
  categoryId: z.number().min(1, "Selecione a categoria"),
})
type VehicleForm = z.infer<typeof vehicleSchema>

export default function CreateVehiclePage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema) })

  useEffect(() => {
    Promise.all([api.get<Brand[]>("/brands"), api.get<Category[]>("/categories")])
      .then(([b, c]) => { setBrands(b.data); setCategories(c.data) })
      .catch(() => toast.error("Erro ao carregar dados."))
  }, [])

  async function onSubmit(data: VehicleForm) {
    try {
      await createVehicle(data)
      toast.success("Veículo criado com sucesso!")
      router.push("/admin/vehicles")
    } catch {
      toast.error("Erro ao criar veículo.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Novo Veículo</h1>
      </div>

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" {...register("model")} />
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" {...register("plate")} />
              {errors.plate && <p className="text-xs text-destructive">{errors.plate.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" {...register("color")} />
              {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="year">Ano</Label>
                <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
                {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="dailyRate">Diária (R$)</Label>
                <Input id="dailyRate" type="number" step="0.01" {...register("dailyRate", { valueAsNumber: true })} />
                {errors.dailyRate && <p className="text-xs text-destructive">{errors.dailyRate.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Marca</Label>
              <Controller
                control={control}
                name="brandId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione a marca" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
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
