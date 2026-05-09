import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const password = await bcrypt.hash("123123", 10);

  await prisma.brand.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Fiat' },
      { name: 'Volkswagen' },
      { name: 'Chevrolet' },
      { name: 'Toyota' },
      { name: 'Honda' },
    ],
  });

  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Econômico',     description: 'Veículos compactos com baixo consumo' },
      { name: 'Intermediário', description: 'Veículos de médio porte com bom conforto' },
      { name: 'SUV',           description: 'Utilitários esportivos com tração e espaço' },
      { name: 'Luxo',          description: 'Veículos premium com alto padrão de acabamento' },
      { name: 'Utilitário',    description: 'Veículos de carga e trabalho pesado' },
    ],
  });

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Admin', email: 'admin@gmail.com', password: password, role: 'admin',    cnhNumber: '12345678900', cnhExpiry: new Date('2028-01-15') },
      { name: 'João',  email: 'joao@gmail.com',  password: password, role: 'customer', cnhNumber: '98765432100', cnhExpiry: new Date('2027-06-30') },
      { name: 'Maria', email: 'maria@gmail.com', password: password, role: 'customer', cnhNumber: '45678901234', cnhExpiry: new Date('2029-03-20') },
    ],
  });

  const brandMap   = Object.fromEntries((await prisma.brand.findMany()).map(b => [b.name, b.id]));
  const catMap     = Object.fromEntries((await prisma.category.findMany()).map(c => [c.name, c.id]));
  const brandId    = (name: string): number => brandMap[name]!;
  const categoryId = (name: string): number => catMap[name]!;

  await prisma.vehicle.createMany({
    skipDuplicates: true,
    data: [
      { model: 'Uno',     year: 2020, plate: 'ABC-1234', color: 'Branco',   dailyRate: 80,  description: 'Versão básica, ideal para cidade',          brandId: brandId('Fiat'),       categoryId: categoryId('Econômico') },
      { model: 'Gol',     year: 2021, plate: 'DEF-5678', color: 'Prata',    dailyRate: 90,  description: 'Clássico popular com boa manutenção',        brandId: brandId('Volkswagen'), categoryId: categoryId('Econômico') },
      { model: 'Onix',    year: 2022, plate: 'GHI-9012', color: 'Preto',    dailyRate: 100, description: 'Líder de vendas com câmbio automático',      brandId: brandId('Chevrolet'),  categoryId: categoryId('Econômico') },
      { model: 'Corolla', year: 2023, plate: 'JKL-3456', color: 'Branco',   dailyRate: 180, description: 'Sedan confortável e econômico',              brandId: brandId('Toyota'),     categoryId: categoryId('Intermediário') },
      { model: 'Civic',   year: 2023, plate: 'MNO-7890', color: 'Vermelho', dailyRate: 160, description: 'Esportivo com excelente desempenho',         brandId: brandId('Honda'),      categoryId: categoryId('Intermediário') },
      { model: 'Compass', year: 2022, plate: 'PQR-1234', color: 'Cinza',    dailyRate: 220, description: 'SUV com tração 4x4 e amplo espaço interno', brandId: brandId('Fiat'),       categoryId: categoryId('SUV') },
      { model: 'T-Cross', year: 2023, plate: 'STU-5678', color: 'Azul',     dailyRate: 230, description: 'SUV compacto com tecnologia avançada',       brandId: brandId('Volkswagen'), categoryId: categoryId('SUV') },
      { model: 'Hilux',   year: 2022, plate: 'VWX-9012', color: 'Preto',    dailyRate: 280, description: 'Caminhonete robusta para trabalho pesado',   brandId: brandId('Toyota'),     categoryId: categoryId('Utilitário') },
    ],
  });

  if (await prisma.rental.count() === 0) {
    const userMap    = Object.fromEntries((await prisma.user.findMany()).map(u => [u.email, u.id]));
    const vehicleMap = Object.fromEntries((await prisma.vehicle.findMany()).map(v => [v.plate, v.id]));
    const userId     = (email: string): number => userMap[email]!;
    const vehicleId  = (plate: string): number => vehicleMap[plate]!;

    await prisma.rental.createMany({
      data: [
        { userId: userId('joao@gmail.com'),  vehicleId: vehicleId('ABC-1234'), isActive: false, startDate: new Date('2026-04-01T08:00:00'), totalDays: 5, expectedEndDate: new Date('2026-04-06T08:00:00'), returnedAt: new Date('2026-04-06T10:00:00'), totalAmount: 400 },
        { userId: userId('maria@gmail.com'), vehicleId: vehicleId('JKL-3456'), isActive: true,  startDate: new Date('2026-05-05T09:00:00'), totalDays: 7, expectedEndDate: new Date('2026-05-12T09:00:00') },
      ],
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
