"use server"

import { serverFetch } from "@/lib/server-fetch"

interface UserData {
  name: string
  email: string
  password?: string
  role: "admin" | "customer"
  cnhNumber: string
  cnhExpiry: string
}

export async function createUser(data: UserData & { password: string }) {
  const res = await serverFetch("/users", {
    method: "POST",
    body: JSON.stringify({ ...data, cnhExpiry: new Date(data.cnhExpiry).toISOString() }),
  })
  if (!res.ok) throw new Error("Erro ao criar usuário")
}

export async function updateUser(id: number, data: UserData) {
  const payload = {
    name: data.name,
    email: data.email,
    role: data.role,
    cnhNumber: data.cnhNumber,
    cnhExpiry: new Date(data.cnhExpiry).toISOString(),
    ...(data.password ? { password: data.password } : {}),
  }
  const res = await serverFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) })
  if (!res.ok) throw new Error("Erro ao atualizar usuário")
}

export async function deleteUser(id: number) {
  const res = await serverFetch(`/users/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Erro ao remover usuário")
}
