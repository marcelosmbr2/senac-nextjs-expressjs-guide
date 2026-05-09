"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Car, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function getCustomerIdFromToken(): number | null {
  try {
    const token = Cookies.get("token")
    if (!token) return null
    const [, payload] = token.split(".")
    const decoded = JSON.parse(atob(payload))
    return decoded.id ?? null
  } catch {
    return null
  }
}

const navLinks = [
  { href: "/customer/home", label: "Dashboard" },
  { href: "/customer/vehicles", label: "Veículos" },
  { href: "/customer/rentals", label: "Minhas Locações" },
]

export function CustomerNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [customerId, setCustomerId] = useState<number | null>(null)

  useEffect(() => { setCustomerId(getCustomerIdFromToken()) }, [])

  function handleLogout() {
    Cookies.remove("token")
    router.push("/")
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/customer/home" className="flex items-center gap-2 font-bold text-lg">
            <Car className="h-5 w-5" />
            LocaCar
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
            <User className="h-4 w-4" />
            {customerId ? `ID: ${customerId}` : "Minha Conta"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
