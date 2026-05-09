"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import dayjs from "dayjs"
import { EyeIcon, PencilIcon, RotateCcwIcon, TrashIcon } from "lucide-react"
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
import type { Rental } from "@/types"
import ReportDialog from "./_components/report-dialog"

export default function RentalsPage() {
  const router = useRouter()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [viewing, setViewing] = useState<Rental | null>(null)

  async function load() {
    const { data } = await api.get<Rental[]>("/rentals")
    setRentals(data)
  }

  useEffect(() => { load() }, [])

  async function handleReturn(id: number) {
    try {
      await api.post(`/rentals/${id}/return`)
      toast.success("Devolução registrada com sucesso!")
      load()
    } catch {
      toast.error("Erro ao registrar devolução.")
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/rentals/${id}`)
      toast.success("Locação removida.")
      load()
    } catch {
      toast.error("Não é possível remover locação já finalizada.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Locações</h1>
        <ReportDialog rentals={rentals} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Previsão</TableHead>
            <TableHead>Dias</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Multa</TableHead>
            <TableHead className="w-36">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{r.id}</TableCell>
              <TableCell>{r.user?.name ?? r.userId}</TableCell>
              <TableCell>
                {r.vehicle?.model ?? r.vehicleId}{" "}
                <span className="text-xs text-muted-foreground">({r.vehicle?.plate})</span>
              </TableCell>
              <TableCell>{dayjs(r.startDate).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{dayjs(r.expectedEndDate).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{r.totalDays}</TableCell>
              <TableCell>
                <Badge variant={r.isActive ? "default" : "secondary"}>
                  {r.isActive ? "Ativa" : "Finalizada"}
                </Badge>
              </TableCell>
              <TableCell>
                {r.totalAmount != null
                  ? r.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "—"}
              </TableCell>
              <TableCell>
                {r.lateFee != null && r.lateFee > 0
                  ? <span className="text-destructive">{r.lateFee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  : "—"}
              </TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(r)} title="Ver detalhes">
                  <EyeIcon className="size-4" />
                </Button>
                {r.isActive && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/rentals/${r.id}/edit`)}
                      title="Editar dias"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" title="Registrar devolução" />}>
                        <RotateCcwIcon className="size-4 text-primary" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Registrar devolução</AlertDialogTitle>
                          <AlertDialogDescription>
                            Confirmar devolução do veículo <strong>{r.vehicle?.model}</strong> da locação #{r.id}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleReturn(r.id)}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" title="Remover" />}>
                    <TrashIcon className="size-4 text-destructive" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover locação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover a locação #{r.id}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {rentals.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                Nenhuma locação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Locação #{viewing?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{viewing?.user?.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Veículo</span>
              <span className="font-medium">
                {viewing?.vehicle?.model}{" "}
                <span className="text-xs font-mono text-muted-foreground">({viewing?.vehicle?.plate})</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Início</span>
              <span className="font-medium">
                {viewing?.startDate ? dayjs(viewing.startDate).format("DD/MM/YYYY") : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Devolução Prevista</span>
              <span className="font-medium">
                {viewing?.expectedEndDate ? dayjs(viewing.expectedEndDate).format("DD/MM/YYYY") : "—"}
              </span>
            </div>
            {viewing?.returnedAt && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Devolvido em</span>
                <span className="font-medium">{dayjs(viewing.returnedAt).format("DD/MM/YYYY")}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Dias</span>
              <span className="font-medium">{viewing?.totalDays}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Valor Total</span>
              <span className="font-medium">
                {viewing?.totalAmount != null
                  ? viewing.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Multa</span>
              <span className={viewing?.lateFee && viewing.lateFee > 0 ? "font-medium text-destructive" : "font-medium"}>
                {viewing?.lateFee && viewing.lateFee > 0
                  ? viewing.lateFee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={viewing?.isActive ? "default" : "secondary"} className="w-fit">
                {viewing?.isActive ? "Ativa" : "Finalizada"}
              </Badge>
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
