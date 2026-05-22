"use server"

import { serverFetch } from "@/lib/server-fetch"

export async function createRental(data: { vehicleId: number; totalDays: number }) {
  const res = await serverFetch("/rentals", { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) {
    const err = new Error("Erro ao registrar locação") as Error & { status: number }
    err.status = res.status
    throw err
  }
}
