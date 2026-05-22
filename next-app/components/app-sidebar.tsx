"use client"

import * as React from "react"
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
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { logout } from "@/app/actions"

const navItems = [
  { title: "Dashboard", url: "/admin/home", icon: LayoutDashboardIcon },
  { title: "Locações", url: "/admin/rentals", icon: CalendarCheckIcon },
  { title: "Veículos", url: "/admin/vehicles", icon: CarIcon },
  { title: "Marcas", url: "/admin/brands", icon: TagIcon },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpenIcon },
  { title: "Usuários", url: "/admin/users", icon: UsersIcon },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userId: number
  role: string
}

export function AppSidebar({ userId, role, ...props }: AppSidebarProps) {
  const pathname = usePathname()

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
                <span className="truncate font-medium">{role === "admin" ? "Admin" : "Usuário"}</span>
                <span className="truncate text-xs text-muted-foreground">ID #{userId}</span>
              </div>
              <button
                onClick={() => logout()}
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
