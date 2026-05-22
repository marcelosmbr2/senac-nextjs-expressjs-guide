"use server"

import { serverFetch } from "@/lib/server-fetch"

export async function createBrand(data: { name: string }) {
  const res = await serverFetch("/brands", { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao criar marca")
}

export async function updateBrand(id: number, data: { name: string }) {
  const res = await serverFetch(`/brands/${id}`, { method: "PUT", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao atualizar marca")
}

export async function deleteBrand(id: number) {
  const res = await serverFetch(`/brands/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Não é possível remover marca com veículos vinculados")
}
