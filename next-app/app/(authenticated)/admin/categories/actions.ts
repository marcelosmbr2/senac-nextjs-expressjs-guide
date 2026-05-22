"use server"

import { serverFetch } from "@/lib/server-fetch"

export async function createCategory(data: { name: string; description?: string }) {
  const res = await serverFetch("/categories", { method: "POST", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao criar categoria")
}

export async function updateCategory(id: number, data: { name: string; description?: string }) {
  const res = await serverFetch(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) })
  if (!res.ok) throw new Error("Erro ao atualizar categoria")
}

export async function deleteCategory(id: number) {
  const res = await serverFetch(`/categories/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Não é possível remover categoria")
}
