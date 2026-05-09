"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Car, ClipboardList, Info } from "lucide-react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import type { Vehicle } from "@/types"

export default function CustomerHomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Vehicle[]>("/vehicles")
      .then(({ data }) => setVehicles(data))
      .catch(() => toast.error("Erro ao carregar dados."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo!</h1>
        <p className="text-muted-foreground mt-1">Aqui você pode explorar e reservar veículos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Veículos no Catálogo</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{vehicles.length}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">veículos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Limite de Locações</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground mt-1">locações ativas simultâneas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Período Máximo</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">30</p>
            <p className="text-xs text-muted-foreground mt-1">dias por locação</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/customer/vehicles" className={buttonVariants()}>
          <Car className="h-4 w-4 mr-2" />
          Ver veículos disponíveis
        </Link>
        <Link href="/customer/rentals" className={buttonVariants({ variant: "outline" })}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Minhas locações
        </Link>
      </div>
    </div>
  )
}
