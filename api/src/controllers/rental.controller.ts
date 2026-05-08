import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";

const createRentalSchema = z.object({
  vehicleId: z.number().int().positive(),
  totalDays: z.number().int().min(1).max(30),
});

const updateRentalSchema = z.object({
  totalDays: z.number().int().min(1).max(30).optional(),
});

const rentalInclude = {
  user: { select: { id: true, name: true, email: true } },
  vehicle: true,
};

export async function getRentals(_req: Request, res: Response) {
  try {
    const rentals = await prisma.rental.findMany({ include: rentalInclude });
    res.json(rentals);
  } catch {
    res.status(500).json({ error: "Erro ao buscar locações" });
  }
}

export async function createRental(req: Request, res: Response) {
  try {
    const { vehicleId, totalDays } = createRentalSchema.parse(req.body);
    const userId = req.userId!;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ error: "Veículo não encontrado" });
      return;
    }

    const activeRental = await prisma.rental.findFirst({
      where: { vehicleId, isActive: true },
    });
    if (activeRental) {
      res.status(409).json({
        error: "Veículo indisponível",
        expectedEndDate: activeRental.expectedEndDate,
      });
      return;
    }

    const activeCount = await prisma.rental.count({
      where: { userId, isActive: true },
    });
    if (activeCount >= 3) {
      res.status(409).json({ error: "Limite de 3 locações ativas atingido" });
      return;
    }

    const startDate = new Date();
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + totalDays);

    const rental = await prisma.rental.create({
      data: { userId, vehicleId, totalDays, startDate, expectedEndDate },
      include: rentalInclude,
    });
    res.status(201).json(rental);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao criar locação" });
  }
}

export async function updateRental(req: Request, res: Response) {
  try {
    const { totalDays } = updateRentalSchema.parse(req.body);
    const rentalId = Number(req.params.id);

    const existing = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!existing) {
      res.status(404).json({ error: "Locação não encontrada" });
      return;
    }
    if (!existing.isActive) {
      res.status(409).json({ error: "Locação já finalizada não pode ser alterada" });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (totalDays !== undefined) {
      updateData.totalDays = totalDays;
      const expectedEndDate = new Date(existing.startDate);
      expectedEndDate.setDate(expectedEndDate.getDate() + totalDays);
      updateData.expectedEndDate = expectedEndDate;
    }

    const rental = await prisma.rental.update({
      where: { id: rentalId },
      data: updateData,
      include: rentalInclude,
    });
    res.json(rental);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: "Erro ao atualizar locação" });
  }
}

export async function returnVehicle(req: Request, res: Response) {
  try {
    const rentalId = Number(req.params.id);

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { vehicle: true },
    });
    if (!rental) {
      res.status(404).json({ error: "Locação não encontrada" });
      return;
    }
    if (!rental.isActive) {
      res.status(409).json({ error: "Veículo já foi devolvido" });
      return;
    }

    const returnedAt = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const actualDays = Math.max(1, Math.ceil((returnedAt.getTime() - rental.startDate.getTime()) / msPerDay));
    const baseAmount = actualDays * rental.vehicle.dailyRate;

    let lateFee = 0;
    if (returnedAt > rental.expectedEndDate) {
      const lateDays = Math.ceil((returnedAt.getTime() - rental.expectedEndDate.getTime()) / msPerDay);
      lateFee = lateDays * rental.vehicle.dailyRate * 0.20;
    }

    const totalAmount = baseAmount + lateFee;

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        isActive: false,
        returnedAt,
        totalAmount,
        lateFee: lateFee > 0 ? lateFee : null,
      },
      include: rentalInclude,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro ao registrar devolução" });
  }
}

export async function deleteRental(req: Request, res: Response) {
  try {
    const rentalId = Number(req.params.id);

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental) {
      res.status(404).json({ error: "Locação não encontrada" });
      return;
    }
    if (!rental.isActive) {
      res.status(409).json({ error: "Locação já finalizada não pode ser excluída" });
      return;
    }

    await prisma.rental.delete({ where: { id: rentalId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erro ao deletar locação" });
  }
}
