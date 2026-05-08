import type { Request, Response, NextFunction } from 'express'

export function customerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'customer') {
    return res.status(403).json({ message: 'Acesso negado' })
  }
  next()
}
