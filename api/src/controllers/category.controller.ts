import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const categoryId = Number(req.params.id);
    const vehicleCount = await prisma.vehicle.count({ where: { categoryId } });
    if (vehicleCount > 0) {
      res.status(409).json({ error: "Categoria possui veículos vinculados e não pode ser removida" });
      return;
    }
    await prisma.category.delete({ where: { id: categoryId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erro ao deletar categoria" });
  }
}
