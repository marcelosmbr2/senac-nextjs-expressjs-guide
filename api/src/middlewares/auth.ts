import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as { id: number; role: string }
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}