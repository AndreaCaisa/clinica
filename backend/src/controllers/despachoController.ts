import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const despacharMedicamento = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { pacienteId, items } = req.body;

  if (!pacienteId || !items || items.length === 0) {
    res.status(400).json({ mensaje: 'Paciente e items son obligatorios' });
    return;
  }

  const detalles = [];
  let total = 0;

  for (const item of items) {
    const insumo = await prisma.insumo.findUnique({
      where: { id: Number(item.insumoId) },
    });

    if (!insumo) {
      res.status(404).json({ mensaje: 'Medicamento no encontrado: ' + item.insumoId });
      return;
    }

    if (insumo.stock < Number(item.cantidad)) {
      res.status(400).json({ mensaje: 'Stock insuficiente para: ' + insumo.nombre + '. Stock actual: ' + insumo.stock });
      return;
    }

    await prisma.insumo.update({
      where: { id: Number(item.insumoId) },
      data: { stock: { decrement: Number(item.cantidad) } },
    });

    const subtotal = insumo.precio * Number(item.cantidad);
    total += subtotal;

    detalles.push({
      descripcion: 'Medicamento: ' + insumo.nombre,
      cantidad: Number(item.cantidad),
      precioUnitario: insumo.precio,
      subtotal,
    });
  }

  const factura = await prisma.factura.create({
    data: {
      pacienteId: Number(pacienteId),
      total,
      detalles: { create: detalles },
    },
    include: { paciente: true, detalles: true },
  });

  res.status(201).json({
    mensaje: 'Medicamentos despachados correctamente',
    factura,
  });
};