"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/axios"
import type { Category } from "@/types"

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [viewing, setViewing] = useState<Category | null>(null)

  async function load() {
    const { data } = await api.get<Category[]>("/categories")
    setCategories(data)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    try {
      await api.delete(`/categories/${id}`)
      toast.success("Categoria removida.")
      load()
    } catch {
      toast.error("Não é possível remover categoria com veículos vinculados.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias</h1>
        <Button onClick={() => router.push("/admin/categories/create")}>
          <PlusIcon className="mr-2 size-4" />Nova categoria
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-28">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="text-muted-foreground">{cat.id}</TableCell>
              <TableCell>{cat.name}</TableCell>
              <TableCell className="text-muted-foreground">{cat.description ?? "—"}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(cat)}>
                  <EyeIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/categories/${cat.id}/edit`)}>
                  <PencilIcon className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
                    <TrashIcon className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover categoria</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{cat.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(cat.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Nenhuma categoria cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Categoria</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium">{viewing?.id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{viewing?.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Descrição</span>
              <span className="font-medium">{viewing?.description ?? "—"}</span>
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
