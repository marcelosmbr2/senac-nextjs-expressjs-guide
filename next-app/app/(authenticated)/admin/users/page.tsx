"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import dayjs from "dayjs"
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/axios"
import type { User } from "@/types"
import { deleteUser } from "./actions"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [viewing, setViewing] = useState<User | null>(null)

  async function load() {
    const { data } = await api.get<User[]>("/users")
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    try {
      await deleteUser(id)
      toast.success("Usuário removido.")
      load()
    } catch {
      toast.error("Não é possível remover usuário com locação ativa.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <Button onClick={() => router.push("/admin/users/create")}>
          <PlusIcon className="mr-2 size-4" />Novo usuário
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>CNH</TableHead>
            <TableHead>Validade CNH</TableHead>
            <TableHead className="w-28">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">{user.cnhNumber}</TableCell>
              <TableCell>{dayjs(user.cnhExpiry).format("DD/MM/YYYY")}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(user)}>
                  <EyeIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                  <PencilIcon className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
                    <TrashIcon className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{user.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(user.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum usuário cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{viewing?.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{viewing?.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={viewing?.role === "admin" ? "default" : "secondary"} className="w-fit">
                {viewing?.role}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">CNH</span>
              <span className="font-medium font-mono">{viewing?.cnhNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Validade da CNH</span>
              <span className="font-medium">
                {viewing?.cnhExpiry ? dayjs(viewing.cnhExpiry).format("DD/MM/YYYY") : "—"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
