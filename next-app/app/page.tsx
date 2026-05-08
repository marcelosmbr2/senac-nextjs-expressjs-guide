"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/axios"
import type { JwtPayload } from "@/types"

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    return null
  }
}

const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    try {
      const {
        data: { token },
      } = await api.post("/login", { email: data.email, password: data.password })
      Cookies.set("token", token, { expires: 1 / 3 }) // 8 horas
      toast.success("Login realizado com sucesso!")
      const payload = parseJwtPayload(token)
      router.push(payload?.role === "admin" ? "/admin/home" : "/customer/home")
    } catch {
      toast.error("Email ou senha inválidos.")
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Entrar na conta</CardTitle>
            <CardDescription>Digite seu email e senha para acessar o painel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@exemplo.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
