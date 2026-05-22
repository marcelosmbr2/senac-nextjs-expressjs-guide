"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { parseJwtPayload } from "@/lib/jwt"

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Credenciais inválidas")
  const { token } = (await res.json()) as { token: string }
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  })
  const payload = parseJwtPayload(token)
  return { role: payload?.role }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
  redirect("/")
}
