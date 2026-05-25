import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const obtenerDashboard = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [
    totalPacientes,
    totalMedicos,
    citasHoy,
    habitacionesDisponibles,
    habitacionesOcupadas,
    facturasPendientes,
    ingresosMes,
    insumosStockBajo,
  ] = await Promise.all([
    prisma.paciente.count(),
    prisma.medico.count(),
    prisma.consulta.count({ where: { fecha: { gte: inicioHoy } } }),
    prisma.habitacion.count({ where: { disponible: true } }),
    prisma.habitacion.count({ where: { disponible: false } }),
    prisma.factura.count({ where: { pagada: false } }),
    prisma.factura.aggregate({
      where: { fecha: { gte: inicioMes }, pagada: true },
      _sum: { total: true },
    }),
    prisma.insumo.count({ where: { stock: { lte: 10 } } }),
  ]);

  res.json({
    totalPacientes,
    totalMedicos,
    citasHoy,
    habitacionesDisponibles,
    habitacionesOcupadas,
    facturasPendientes,
    ingresosMes: ingresosMes._sum.total || 0,
    insumosStockBajo,
  });
};
