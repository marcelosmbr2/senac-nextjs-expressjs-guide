"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"
import {
  CarIcon,
  CalendarCheckIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import api from "@/lib/axios"
import type { Rental } from "@/types"

export default function DashboardPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [vehicleCount, setVehicleCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [{ data: r }, { data: v }, { data: u }] = await Promise.all([
        api.get<Rental[]>("/rentals"),
        api.get("/vehicles"),
        api.get("/users"),
      ])
      setRentals(r)
      setVehicleCount(v.length)
      setUserCount(u.length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activeRentals = rentals.filter((r) => r.isActive).length
  const totalRevenue = rentals.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0)

  const rentalsByMonth = Object.entries(
    rentals.reduce<Record<string, number>>((acc, r) => {
      const month = dayjs(r.startDate).format("MMM/YY")
      acc[month] = (acc[month] ?? 0) + 1
      return acc
    }, {})
  )
    .slice(-6)
    .map(([month, total]) => ({ month, total }))

  const revenueByMonth = Object.entries(
    rentals.reduce<Record<string, number>>((acc, r) => {
      const month = dayjs(r.startDate).format("MMM/YY")
      acc[month] = (acc[month] ?? 0) + (r.totalAmount ?? 0)
      return acc
    }, {})
  )
    .slice(-6)
    .map(([month, receita]) => ({ month, receita }))

  const topVehicles = Object.entries(
    rentals.reduce<Record<string, number>>((acc, r) => {
      const label = `${r.vehicle?.model ?? r.vehicleId}`
      acc[label] = (acc[label] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([veiculo, locacoes]) => ({ veiculo, locacoes }))

  if (loading) {
    return (
      <div className="p-4 text-muted-foreground">Carregando dashboard...</div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <CarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vehicleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Locações ativas
            </CardTitle>
            <CalendarCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeRentals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita total</CardTitle>
            <DollarSignIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Locações por período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rentalsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="total"
                  name="Locações"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Receita mensal (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number"
                      ? v.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : String(v)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Veículos mais alugados (top 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVehicles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="veiculo"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar
                dataKey="locacoes"
                name="Locações"
                fill="var(--primary)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
