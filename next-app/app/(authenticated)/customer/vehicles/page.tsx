"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import type { Brand, Category, Vehicle } from "@/types"

const bookingSchema = z.object({
  totalDays: z.number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 dia")
    .max(30, "Máximo 30 dias"),
})

type BookingForm = z.infer<typeof bookingSchema>

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { totalDays: 1 },
  })

  const totalDays = watch("totalDays") || 0
  const totalCost = bookingVehicle ? totalDays * bookingVehicle.dailyRate : 0

  useEffect(() => {
    Promise.all([
      api.get<Vehicle[]>("/vehicles"),
      api.get<Brand[]>("/brands"),
      api.get<Category[]>("/categories"),
    ])
      .then(([v, b, c]) => {
        setVehicles(v.data)
        setBrands(b.data)
        setCategories(c.data)
      })
      .catch(() => toast.error("Erro ao carregar veículos."))
      .finally(() => setLoading(false))
  }, [])

  const filtered = vehicles.filter((v) => {
    if (selectedBrand !== "all" && v.brandId !== Number(selectedBrand)) return false
    if (selectedCategory !== "all" && v.categoryId !== Number(selectedCategory)) return false
    return true
  })

  function openBooking(vehicle: Vehicle) {
    setBookingVehicle(vehicle)
    reset({ totalDays: 1 })
  }

  function closeBooking() {
    setBookingVehicle(null)
    reset({ totalDays: 1 })
  }

  async function onSubmit(data: BookingForm) {
    if (!bookingVehicle) return
    try {
      await api.post("/rentals", { vehicleId: bookingVehicle.id, totalDays: data.totalDays })
      toast.success("Locação registrada com sucesso!")
      closeBooking()
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("Veículo indisponível no momento.")
      } else if (status === 400) {
        toast.error("Você já possui 3 locações ativas.")
      } else {
        toast.error("Erro ao registrar locação.")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo de Veículos</h1>
        <p className="text-muted-foreground mt-1">Escolha um veículo e faça sua reserva.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedBrand} onValueChange={(v) => setSelectedBrand(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Car className="h-12 w-12" />
          <p>Nenhum veículo encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vehicle) => (
            <Card key={vehicle.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{vehicle.model}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {vehicle.dailyRate.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    /dia
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Marca:</span> {vehicle.brand.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Categoria:</span>{" "}
                  {vehicle.category.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Ano:</span> {vehicle.year}
                </p>
                <p>
                  <span className="font-medium text-foreground">Cor:</span> {vehicle.color}
                </p>
                {vehicle.description && (
                  <p className="mt-2 text-xs line-clamp-2">{vehicle.description}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => openBooking(vehicle)}>
                  Alugar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!bookingVehicle} onOpenChange={(open) => { if (!open) closeBooking() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alugar {bookingVehicle?.model}</DialogTitle>
            <DialogDescription>
              {bookingVehicle?.brand.name} · {bookingVehicle?.category.name} ·{" "}
              {bookingVehicle?.year}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="totalDays">Número de dias (1–30)</Label>
              <Input
                id="totalDays"
                type="number"
                min={1}
                max={30}
                {...register("totalDays", { valueAsNumber: true })}
                aria-invalid={!!errors.totalDays}
              />
              {errors.totalDays && (
                <p className="text-xs text-destructive">{errors.totalDays.message}</p>
              )}
            </div>
            <div className="rounded-lg bg-muted p-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total estimado</span>
              <span className="text-xl font-bold">
                {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeBooking}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Confirmar Reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
