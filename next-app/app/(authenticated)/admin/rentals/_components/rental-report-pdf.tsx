import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import dayjs from "dayjs"
import type { Rental } from "@/types"

export interface ReportFilters {
  status: "all" | "active" | "finished"
  dateFrom: string
  dateTo: string
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#111" },
  header: { marginBottom: 16 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#555" },
  filterRow: { flexDirection: "row", gap: 12, marginBottom: 12, color: "#555" },
  filterLabel: { fontFamily: "Helvetica-Bold" },
  table: { borderWidth: 1, borderColor: "#ddd", borderRadius: 2 },
  thead: { flexDirection: "row", backgroundColor: "#f3f4f6" },
  tbody: {},
  tr: { flexDirection: "row", borderTopWidth: 1, borderColor: "#e5e7eb" },
  th: { padding: "5 6", fontFamily: "Helvetica-Bold", fontSize: 8 },
  td: { padding: "5 6", fontSize: 8 },
  col_id: { width: 28 },
  col_client: { width: 90, flexShrink: 1 },
  col_vehicle: { width: 80, flexShrink: 1 },
  col_plate: { width: 52 },
  col_start: { width: 54 },
  col_end: { width: 54 },
  col_days: { width: 30 },
  col_status: { width: 44 },
  col_total: { width: 54 },
  col_fee: { width: 44 },
  footer: { marginTop: 14, flexDirection: "row", justifyContent: "space-between", color: "#555" },
  footerBold: { fontFamily: "Helvetica-Bold", color: "#111" },
  badge: { padding: "1 4", borderRadius: 3 },
  badgeActive: { backgroundColor: "#dcfce7", color: "#166534" },
  badgeFinished: { backgroundColor: "#f3f4f6", color: "#555" },
})

function fmt(value: number | undefined | null): string {
  if (value == null) return "—"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function filterLabel(filters: ReportFilters): string {
  const parts: string[] = []
  const statusMap = { all: "Todas", active: "Ativas", finished: "Finalizadas" }
  parts.push(`Status: ${statusMap[filters.status]}`)
  if (filters.dateFrom) parts.push(`De: ${dayjs(filters.dateFrom).format("DD/MM/YYYY")}`)
  if (filters.dateTo) parts.push(`Até: ${dayjs(filters.dateTo).format("DD/MM/YYYY")}`)
  return parts.join("   |   ")
}

interface Props {
  rentals: Rental[]
  filters: ReportFilters
}

export default function RentalReportPDF({ rentals, filters }: Props) {
  const totalAmount = rentals.reduce((acc, r) => acc + (r.totalAmount ?? 0), 0)
  const totalFee = rentals.reduce((acc, r) => acc + (r.lateFee ?? 0), 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Locações</Text>
          <Text style={styles.subtitle}>
            Gerado em {dayjs().format("DD/MM/YYYY [às] HH:mm")}
          </Text>
        </View>

        <View style={styles.filterRow}>
          <Text><Text style={styles.filterLabel}>Filtros: </Text>{filterLabel(filters)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.col_id]}>ID</Text>
            <Text style={[styles.th, styles.col_client]}>Cliente</Text>
            <Text style={[styles.th, styles.col_vehicle]}>Veículo</Text>
            <Text style={[styles.th, styles.col_plate]}>Placa</Text>
            <Text style={[styles.th, styles.col_start]}>Início</Text>
            <Text style={[styles.th, styles.col_end]}>Prev. Dev.</Text>
            <Text style={[styles.th, styles.col_days]}>Dias</Text>
            <Text style={[styles.th, styles.col_status]}>Status</Text>
            <Text style={[styles.th, styles.col_total]}>Total</Text>
            <Text style={[styles.th, styles.col_fee]}>Multa</Text>
          </View>

          <View style={styles.tbody}>
            {rentals.map((r) => (
              <View key={r.id} style={styles.tr}>
                <Text style={[styles.td, styles.col_id]}>{r.id}</Text>
                <Text style={[styles.td, styles.col_client]}>{r.user?.name ?? r.userId}</Text>
                <Text style={[styles.td, styles.col_vehicle]}>{r.vehicle?.model ?? r.vehicleId}</Text>
                <Text style={[styles.td, styles.col_plate]}>{r.vehicle?.plate ?? "—"}</Text>
                <Text style={[styles.td, styles.col_start]}>{dayjs(r.startDate).format("DD/MM/YYYY")}</Text>
                <Text style={[styles.td, styles.col_end]}>{dayjs(r.expectedEndDate).format("DD/MM/YYYY")}</Text>
                <Text style={[styles.td, styles.col_days]}>{r.totalDays}</Text>
                <View style={[styles.td, styles.col_status]}>
                  <Text style={[styles.badge, r.isActive ? styles.badgeActive : styles.badgeFinished]}>
                    {r.isActive ? "Ativa" : "Finalizada"}
                  </Text>
                </View>
                <Text style={[styles.td, styles.col_total]}>{fmt(r.totalAmount)}</Text>
                <Text style={[styles.td, styles.col_fee]}>{r.lateFee && r.lateFee > 0 ? fmt(r.lateFee) : "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            <Text style={styles.footerBold}>Total de registros: </Text>{rentals.length}
          </Text>
          <Text>
            <Text style={styles.footerBold}>Valor total: </Text>{fmt(totalAmount)}
            {"   "}
            <Text style={styles.footerBold}>Multas: </Text>{fmt(totalFee)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
