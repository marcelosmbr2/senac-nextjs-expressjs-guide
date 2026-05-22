import { CustomerNavbar } from "@/components/customer-navbar"
import { cookies } from "next/headers"
import { parseJwtPayload } from "@/lib/jwt"

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const token = (await cookies()).get("token")?.value
  const payload = parseJwtPayload(token!)

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar customerId={payload!.id} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
