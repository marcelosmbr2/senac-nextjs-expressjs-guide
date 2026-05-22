import type { JwtPayload } from "@/types"

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    return null
  }
}
