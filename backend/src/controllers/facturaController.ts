import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/facturas
export const listarFacturas = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const facturas = await prisma.factura.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      paciente: true,
      detalles: true,
    },
  });
  res.json(facturas);
};

// POST /api/facturas
export const crearFactura = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { pacienteId, detalles } = req.body;

  if (!pacienteId || !detalles || detalles.length === 0) {
    res.status(400).json({ mensaje: 'Paciente y detalles son obligatorios' });
    return;
  }

  const total = detalles.reduce(
    (acc: number, d: { cantidad: number; precioUnitario: number }) =>
      acc + d.cantidad * d.precioUnitario,
    0,
  );

  const factura = await prisma.factura.create({
    data: {
      pacienteId: Number(pacienteId),
      total,
      detalles: {
        create: detalles.map((d: {
          descripcion: string;
          cantidad: number;
          precioUnitario: number;
        }) => ({
          descripcion: d.descripcion,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subtotal: Number(d.cantidad) * Number(d.precioUnitario),
        })),
      },
    },
    include: { paciente: true, detalles: true },
  });

  res.status(201).json(factura);
};

// PUT /api/facturas/:id/pagar
export const pagarFactura = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  const factura = await prisma.factura.update({
    where: { id: Number(id) },
    data: { pagada: true },
  });

  res.json(factura);
};

export const obtenerFacturasPaciente = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { pacienteId } = req.params;
  const facturas = await prisma.factura.findMany({
    where: { pacienteId: Number(pacienteId) },
    orderBy: { fecha: 'desc' },
    include: { detalles: true },
  });
  res.json(facturas);
};

export const eliminarFactura = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.detalleFactura.deleteMany({ where: { facturaId: Number(id) } });
  await prisma.factura.delete({ where: { id: Number(id) } });
  res.json({ mensaje: 'Factura eliminada correctamente' });
};

export const agregarDetalle = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { descripcion, cantidad, precioUnitario } = req.body;
  if (!descripcion || !cantidad || !precioUnitario) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    return;
  }
  const subtotal = Number(cantidad) * Number(precioUnitario);
  await prisma.detalleFactura.create({
    data: { facturaId: Number(id), descripcion, cantidad: Number(cantidad), precioUnitario: Number(precioUnitario), subtotal },
  });
  const detalles = await prisma.detalleFactura.findMany({ where: { facturaId: Number(id) } });
  const nuevoTotal = detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const factura = await prisma.factura.update({
    where: { id: Number(id) },
    data: { total: nuevoTotal },
    include: { paciente: true, detalles: true },
  });
  res.json(factura);
};
