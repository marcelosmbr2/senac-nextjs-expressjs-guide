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
import type { Brand } from "@/types"
import { deleteBrand } from "./actions"

export default function BrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [viewing, setViewing] = useState<Brand | null>(null)

  async function load() {
    const { data } = await api.get<Brand[]>("/brands")
    setBrands(data)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    try {
      await deleteBrand(id)
      toast.success("Marca removida.")
      load()
    } catch {
      toast.error("Não é possível remover marca com veículos vinculados.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Marcas</h1>
        <Button onClick={() => router.push("/admin/brands/create")}>
          <PlusIcon className="mr-2 size-4" />Nova marca
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-28">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="text-muted-foreground">{brand.id}</TableCell>
              <TableCell>{brand.name}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(brand)}>
                  <EyeIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/brands/${brand.id}/edit`)}>
                  <PencilIcon className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
                    <TrashIcon className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover marca</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{brand.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(brand.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {brands.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhuma marca cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Marca</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
