"use server"

import { serverFetch } from "@/lib/server-fetch"

export async function updateRental(id: number, data: { totalDays: number }) {
  const res = await serverFetch(`/rentals/${id}`, { method: "PUT", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao atualizar locação")
}

export async function returnRental(id: number) {
  const res = await serverFetch(`/rentals/${id}/return`, { method: "POST" })
  if (!res.ok) throw new Error("Erro ao registrar devolução")
}

export async function deleteRental(id: number) {
  const res = await serverFetch(`/rentals/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Não é possível remover locação já finalizada")
}
