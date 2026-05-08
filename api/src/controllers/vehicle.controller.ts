import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";

const createVehicleSchema = z.object({
  model: z.string().min(1),
  year: z.number().int().min(1900),
  plate: z.string().min(1),
  color: z.string().min(1),
  dailyRate: z.number().positive(),
  description: z.string().optional(),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
});

const updateVehicleSchema = createVehicleSchema.partial();

const vehicleInclude = {
  brand: true,
  category: true,
};

export async function getVehicles(_req: Request, res: Response) {
  try {
    const vehicles = await prisma.vehicle.findMany({ include: vehicleInclude });
    res.json(vehicles);
  } catch {
    res.status(500).json({ error: "Erro ao buscar veículos" });
  }
}

export async function createVehicle(req: Request, res: Response) {
  try {
    const data = createVehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({ data, include: vehicleInclude });
    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao criar veículo" });
  }
}

export async function updateVehicle(req: Request, res: Response) {
  try {
    const data = updateVehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(req.params.id) },
      data,
      include: vehicleInclude,
    });
    res.json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao atualizar veículo" });
  }
}

export async function deleteVehicle(req: Request, res: Response) {
  try {
    const vehicleId = Number(req.params.id);
    const activeRental = await prisma.rental.findFirst({
      where: { vehicleId, isActive: true },
    });
    if (activeRental) {
      res.status(409).json({ error: "Veículo possui locação ativa e não pode ser removido" });
      return;
    }
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erro ao deletar veículo" });
  }
}
