import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import dayjs from "dayjs"
import type { Vehicle } from "@/types"

export interface VehicleReportFilters {
  brand: string
  category: string
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
  col_model: { width: 110, flexShrink: 1 },
  col_brand: { width: 80, flexShrink: 1 },
  col_category: { width: 80, flexShrink: 1 },
  col_year: { width: 36 },
  col_plate: { width: 58 },
  col_color: { width: 60 },
  col_rate: { width: 64 },
  footer: { marginTop: 14, flexDirection: "row", justifyContent: "space-between", color: "#555" },
  footerBold: { fontFamily: "Helvetica-Bold", color: "#111" },
})

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function filterLabel(filters: VehicleReportFilters): string {
  const parts: string[] = []
  parts.push(`Marca: ${filters.brand === "all" ? "Todas" : filters.brand}`)
  parts.push(`Categoria: ${filters.category === "all" ? "Todas" : filters.category}`)
  return parts.join("   |   ")
}

interface Props {
  vehicles: Vehicle[]
  filters: VehicleReportFilters
}

export default function VehicleReportPDF({ vehicles, filters }: Props) {
  const totalRate = vehicles.reduce((acc, v) => acc + v.dailyRate, 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Veículos</Text>
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
            <Text style={[styles.th, styles.col_model]}>Modelo</Text>
            <Text style={[styles.th, styles.col_brand]}>Marca</Text>
            <Text style={[styles.th, styles.col_category]}>Categoria</Text>
            <Text style={[styles.th, styles.col_year]}>Ano</Text>
            <Text style={[styles.th, styles.col_plate]}>Placa</Text>
            <Text style={[styles.th, styles.col_color]}>Cor</Text>
            <Text style={[styles.th, styles.col_rate]}>Diária</Text>
          </View>

          <View style={styles.tbody}>
            {vehicles.map((v) => (
              <View key={v.id} style={styles.tr}>
                <Text style={[styles.td, styles.col_id]}>{v.id}</Text>
                <Text style={[styles.td, styles.col_model]}>{v.model}</Text>
                <Text style={[styles.td, styles.col_brand]}>{v.brand?.name ?? "—"}</Text>
                <Text style={[styles.td, styles.col_category]}>{v.category?.name ?? "—"}</Text>
                <Text style={[styles.td, styles.col_year]}>{v.year}</Text>
                <Text style={[styles.td, styles.col_plate]}>{v.plate}</Text>
                <Text style={[styles.td, styles.col_color]}>{v.color}</Text>
                <Text style={[styles.td, styles.col_rate]}>{fmt(v.dailyRate)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            <Text style={styles.footerBold}>Total de registros: </Text>{vehicles.length}
          </Text>
          <Text>
            <Text style={styles.footerBold}>Soma das diárias: </Text>{fmt(totalRate)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
