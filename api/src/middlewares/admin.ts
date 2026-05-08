import type { Request, Response, NextFunction } from 'express'

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' })
  }
  next()
}