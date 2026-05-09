"use client"

import { useMemo, useState } from "react"
import { pdf } from "@react-pdf/renderer"
import dayjs from "dayjs"
import { FileTextIcon, LoaderIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vehicle } from "@/types"
import VehicleReportPDF, { type VehicleReportFilters } from "./vehicle-report-pdf"

interface Props {
  vehicles: Vehicle[]
}

export default function ReportDialog({ vehicles }: Props) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filters, setFilters] = useState<VehicleReportFilters>({
    brand: "all",
    category: "all",
  })

  const brands = useMemo(() => {
    const seen = new Set<string>()
    return vehicles
      .map((v) => v.brand?.name)
      .filter((name): name is string => !!name && !seen.has(name) && !!seen.add(name))
  }, [vehicles])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    return vehicles
      .map((v) => v.category?.name)
      .filter((name): name is string => !!name && !seen.has(name) && !!seen.add(name))
  }, [vehicles])

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.brand !== "all" && v.brand?.name !== filters.brand) return false
      if (filters.category !== "all" && v.category?.name !== filters.category) return false
      return true
    })
  }, [vehicles, filters])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const blob = await pdf(<VehicleReportPDF vehicles={filtered} filters={filters} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-veiculos-${dayjs().format("YYYY-MM-DD")}.pdf`
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
              <Label>Marca</Label>
              <Select
                value={filters.brand}
                onValueChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "veículo" : "veículos"} {filtered.length === 1 ? "será incluído" : "serão incluídos"} no relatório.
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
