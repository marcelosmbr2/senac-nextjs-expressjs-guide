/*
jsonwebtoken: https://www.npmjs.com/package/jsonwebtoken
Password Hash: https://www.npmjs.com/package/bcryptjs
Validation: https://zod.dev/#installation
*/

import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(_req: Request, res: Response) {
  try {

    const requestValidation = loginSchema.safeParse(_req.body)

    if (!requestValidation.success) {
        return res.status(400).json({ errors: requestValidation.error.flatten() })
    }

    const { email, password } = requestValidation.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
    )

    return res.status(200).json({ token });
    
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}