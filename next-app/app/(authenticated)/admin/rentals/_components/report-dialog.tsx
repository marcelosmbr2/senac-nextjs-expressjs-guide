"use client"

import { useMemo, useState } from "react"
import { pdf } from "@react-pdf/renderer"
import dayjs from "dayjs"
import { FileTextIcon, LoaderIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Rental } from "@/types"
import RentalReportPDF, { type ReportFilters } from "./rental-report-pdf"

interface Props {
  rentals: Rental[]
}

export default function ReportDialog({ rentals }: Props) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>({
    status: "all",
    dateFrom: "",
    dateTo: "",
  })

  const filtered = useMemo(() => {
    return rentals.filter((r) => {
      if (filters.status === "active" && !r.isActive) return false
      if (filters.status === "finished" && r.isActive) return false
      if (filters.dateFrom && dayjs(r.startDate).isBefore(dayjs(filters.dateFrom), "day")) return false
      if (filters.dateTo && dayjs(r.startDate).isAfter(dayjs(filters.dateTo), "day")) return false
      return true
    })
  }, [rentals, filters])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const blob = await pdf(<RentalReportPDF rentals={filtered} filters={filters} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-locacoes-${dayjs().format("YYYY-MM-DD")}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setOpen(false)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileTextIcon className="size-4" />
        Gerar Relatório
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Relatório PDF</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v as ReportFilters["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="finished">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Data de início — de</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Data de início — até</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "locação" : "locações"} serão incluídas no relatório.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={generating || filtered.length === 0}>
              {generating && <LoaderIcon className="size-4 animate-spin" />}
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
