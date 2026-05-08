import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";

const brandSchema = z.object({
  name: z.string().min(1),
});

export async function getBrands(_req: Request, res: Response) {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch {
    res.status(500).json({ error: "Erro ao buscar marcas" });
  }
}

export async function createBrand(req: Request, res: Response) {
  try {
    const data = brandSchema.parse(req.body);
    const brand = await prisma.brand.create({ data });
    res.status(201).json(brand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao criar marca" });
  }
}

export async function updateBrand(req: Request, res: Response) {
  try {
    const data = brandSchema.parse(req.body);
    const brand = await prisma.brand.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(brand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao atualizar marca" });
  }
}

export async function deleteBrand(req: Request, res: Response) {
  try {
    const brandId = Number(req.params.id);
    const vehicleCount = await prisma.vehicle.count({ where: { brandId } });
    if (vehicleCount > 0) {
      res.status(409).json({ error: "Marca possui veículos vinculados e não pode ser removida" });
      return;
    }
    await prisma.brand.delete({ where: { id: brandId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erro ao deletar marca" });
  }
}
