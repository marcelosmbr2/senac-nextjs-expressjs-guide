"use server"

import { serverFetch } from "@/lib/server-fetch"

interface VehicleData {
  model: string
  year: number
  plate: string
  color: string
  dailyRate: number
  description?: string
  brandId: number
  categoryId: number
}

export async function createVehicle(data: VehicleData) {
  const res = await serverFetch("/vehicles", { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao criar veículo")
}

export async function updateVehicle(id: number, data: VehicleData) {
  const res = await serverFetch(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao atualizar veículo")
}

export async function deleteVehicle(id: number) {
  const res = await serverFetch(`/vehicles/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Erro ao remover veículo")
}
