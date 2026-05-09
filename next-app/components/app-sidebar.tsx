"use client"

import * as React from "react"
import Cookies from "js-cookie"
import {
  LayoutDashboardIcon,
  CarIcon,
  TagIcon,
  FolderOpenIcon,
  UsersIcon,
  CalendarCheckIcon,
  CarFrontIcon,
  LogOutIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { JwtPayload } from "@/types"
import Link from "next/link"

const navItems = [
  { title: "Dashboard", url: "/admin/home", icon: LayoutDashboardIcon },
  { title: "Locações", url: "/admin/rentals", icon: CalendarCheckIcon },
  { title: "Veículos", url: "/admin/vehicles", icon: CarIcon },
  { title: "Marcas", url: "/admin/brands", icon: TagIcon },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpenIcon },
  { title: "Usuários", url: "/admin/users", icon: UsersIcon },
]

function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    return null
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()

  const token = Cookies.get("token")
  const payload = token ? parseJwt(token) : null

  function handleLogout() {
    Cookies.remove("token")
    router.push("/")
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin/home" prefetch />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CarFrontIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">LocaCar</span>
                <span className="truncate text-xs">Painel Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} prefetch />}
                    className={cn(pathname.startsWith(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground")}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1 text-sm">
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{payload?.role === "admin" ? "Admin" : "Usuário"}</span>
                <span className="truncate text-xs text-muted-foreground">ID #{payload?.id}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <LogOutIcon className="size-4" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
