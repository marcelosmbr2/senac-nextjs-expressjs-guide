"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import dayjs from "dayjs"
import { ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/axios"
import type { Rental } from "@/types"

function getIdFromToken(): number | null {
  try {
    const token = Cookies.get("token")
    if (!token) return null
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload)).id ?? null
  } catch {
    return null
  }
}

export default function CustomerRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    const userId = getIdFromToken()
    api
      .get<Rental[]>("/rentals")
      .then(({ data }) => {
        setRentals(userId ? data.filter((r) => r.userId === userId) : data)
      })
      .catch((error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 403) {
          setForbidden(true)
        } else {
          toast.error("Erro ao carregar locações.")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Minhas Locações</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Informação indisponível
            </CardTitle>
            <CardDescription>
              Não foi possível carregar suas locações. Entre em contato com a administração.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Locações</h1>
        <p className="text-muted-foreground mt-1">Histórico das suas locações.</p>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <ClipboardList className="h-12 w-12" />
          <p>Você ainda não possui locações.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Devolução Prevista</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.vehicle.model}</TableCell>
                    <TableCell>{dayjs(rental.startDate).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{dayjs(rental.expectedEndDate).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{rental.totalDays}</TableCell>
                    <TableCell>
                      {rental.totalAmount
                        ? rental.totalAmount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rental.isActive ? "default" : "secondary"}>
                        {rental.isActive ? "Ativa" : "Finalizada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
