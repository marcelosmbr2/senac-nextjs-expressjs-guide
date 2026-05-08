import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import z from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["admin", "customer"]),
  cnhNumber: z.string().min(1),
  cnhExpiry: z.string().datetime(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "customer"]).optional(),
  cnhNumber: z.string().min(1).optional(),
  cnhExpiry: z.string().datetime().optional(),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  cnhNumber: true,
  cnhExpiry: true,
};

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({ select: userSelect });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: userSelect,
    });
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const data = createUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: userSelect,
    });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const data = updateUserSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      select: userSelect,
    });
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const activeRental = await prisma.rental.findFirst({
      where: { userId, isActive: true },
    });
    if (activeRental) {
      res.status(409).json({ error: "Usuário possui locação ativa e não pode ser removido" });
      return;
    }
    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}
