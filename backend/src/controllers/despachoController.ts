import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const despacharMedicamento = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { pacienteId, insumoId, cantidad } = req.body;

  if (!pacienteId || !insumoId || !cantidad) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    return;
  }

  const insumo = await prisma.insumo.findUnique({
    where: { id: Number(insumoId) },
  });

  if (!insumo) {
    res.status(404).json({ mensaje: 'Medicamento no encontrado' });
    return;
  }

  if (insumo.stock < Number(cantidad)) {
    res.status(400).json({ mensaje: 'Stock insuficiente. Stock actual: ' + insumo.stock });
    return;
  }

  await prisma.insumo.update({
    where: { id: Number(insumoId) },
    data: { stock: { decrement: Number(cantidad) } },
  });

  const subtotal = insumo.precio * Number(cantidad);

  const factura = await prisma.factura.create({
    data: {
      pacienteId: Number(pacienteId),
      total: subtotal,
      detalles: {
        create: [{
          descripcion: 'Medicamento: ' + insumo.nombre,
          cantidad: Number(cantidad),
          precioUnitario: insumo.precio,
          subtotal,
        }],
      },
    },
    include: { paciente: true, detalles: true },
  });

  res.status(201).json({
    mensaje: 'Medicamento despachado correctamente',
    factura,
    stockRestante: insumo.stock - Number(cantidad),
  });
};
