import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldXIcon } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6">
      <ShieldXIcon className="size-12 text-destructive" />
      <h1 className="text-2xl font-semibold">Acesso negado</h1>
      <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      <Button variant="outline" render={<Link href="/" />}>
        Voltar ao login
      </Button>
    </div>
  )
}
