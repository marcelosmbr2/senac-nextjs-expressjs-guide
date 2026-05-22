import { cookies } from "next/headers"

export async function serverFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("token")?.value
  return fetch(process.env.NEXT_PUBLIC_API_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
}
