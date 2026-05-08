import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import appRoutes from './routes/routes'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use('/', appRoutes)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
