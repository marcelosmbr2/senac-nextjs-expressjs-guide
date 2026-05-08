import { CustomerNavbar } from "@/components/customer-navbar"

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
