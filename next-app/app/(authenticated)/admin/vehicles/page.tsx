"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import type { Vehicle } from "@/types"

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [viewing, setViewing] = useState<Vehicle | null>(null)

  async function load() {
    const { data } = await api.get<Vehicle[]>("/vehicles")
    setVehicles(data)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: number) {
    try {
      await api.delete(`/vehicles/${id}`)
      toast.success("Veículo removido.")
      load()
    } catch {
      toast.error("Não é possível remover veículo com locação ativa.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Veículos</h1>
        <Button size="sm" onClick={() => router.push("/admin/vehicles/create")}>
          <PlusIcon className="mr-2 size-4" />Novo veículo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modelo</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Diária</TableHead>
            <TableHead className="w-28">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.model}</TableCell>
              <TableCell className="font-mono text-sm">{v.plate}</TableCell>
              <TableCell>{v.brand?.name}</TableCell>
              <TableCell>{v.category?.name}</TableCell>
              <TableCell>{v.year}</TableCell>
              <TableCell>
                {v.dailyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(v)}>
                  <EyeIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/vehicles/${v.id}/edit`)}>
                  <PencilIcon className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
                    <TrashIcon className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover veículo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{v.model} ({v.plate})</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(v.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Nenhum veículo cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Modelo</span>
              <span className="font-medium">{viewing?.model}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Placa</span>
              <span className="font-medium font-mono">{viewing?.plate}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Cor</span>
              <span className="font-medium">{viewing?.color}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Ano</span>
              <span className="font-medium">{viewing?.year}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Diária</span>
              <span className="font-medium">
                {viewing?.dailyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Marca</span>
              <span className="font-medium">{viewing?.brand?.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Categoria</span>
              <Badge variant="secondary" className="w-fit">{viewing?.category?.name}</Badge>
            </div>
            {viewing?.description && (
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-muted-foreground">Descrição</span>
                <span className="font-medium">{viewing.description}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
