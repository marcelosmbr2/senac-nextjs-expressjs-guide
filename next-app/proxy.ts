/*
  Proxy do Next.js
  --------------------
  Proxy é um código que roda ANTES de qualquer página ou rota ser carregada.
  Aqui usamos ele para proteger páginas: se o usuário não estiver logado (ou não
  tiver permissão), ele é redirecionado antes mesmo de ver o conteúdo.

  Guia oficial: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
*/

import { NextRequest, NextResponse } from "next/server"
import type { JwtPayload } from "@/types"

// Rotas que só administradores podem acessar
const ADMIN_PATHS = ["/admin"]

// Rotas que só clientes (customers) podem acessar
const CUSTOMER_PATHS = ["/customer"]

/*
  JWT (JSON Web Token) é uma forma de representar informações de login de forma
  segura. Ele tem 3 partes separadas por ponto: header.payload.assinatura

  Esta função extrai e decodifica o "payload" (a parte do meio), que contém
  dados do usuário como o papel dele (admin ou customer).

  Se o token for inválido ou corrompido, retorna null.
*/
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    // Separa as 3 partes do token e pega apenas a do meio (índice 1)
    const [, payload] = token.split(".")
    // atob() decodifica de Base64 para texto; JSON.parse() transforma em objeto
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    // Se qualquer passo falhar (token mal formado), retorna null com segurança
    return null
  }
}

/*
  Função principal do Proxy — executada automaticamente pelo Next.js
  em toda requisição que bata com o padrão definido em `config.matcher` abaixo.
*/
export function proxy(request: NextRequest) {
  // Pega o caminho da URL atual, ex: "/admin/dashboard" ou "/customer/orders"
  const { pathname } = request.nextUrl

  // Verifica se a rota atual começa com algum caminho protegido
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isCustomerPath = CUSTOMER_PATHS.some((p) => pathname.startsWith(p))

  // Se a rota não for protegida, libera o acesso normalmente
  if (!isAdminPath && !isCustomerPath) {
    return NextResponse.next()
  }

  // Tenta ler o token JWT que fica salvo no cookie chamado "token"
  const token = request.cookies.get("token")?.value

  // Se não há token, o usuário não está logado — redireciona para a página inicial
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Decodifica o token para ler as informações do usuário
  const payload = parseJwtPayload(token)

  // Se o token existir mas for inválido, apaga o cookie e redireciona para o início
  if (!payload) {
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete("token")
    return response
  }

  // Um cliente tentando acessar área de admin → sem permissão
  if (isAdminPath && payload.role === "customer") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Um admin tentando acessar área de cliente → sem permissão
  if (isCustomerPath && payload.role === "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Usuário autenticado e com a permissão correta — libera o acesso
  return NextResponse.next()
}

/*
  Define em quais rotas este Proxy será ativado.
  O padrão ":path*" significa "essa rota e qualquer sub-rota".
  Ex: "/admin", "/admin/users", "/admin/settings" etc.
*/
export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
  ],
}
