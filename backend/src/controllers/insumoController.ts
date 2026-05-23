import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const listarInsumos = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const insumos = await prisma.insumo.findMany({ orderBy: { nombre: 'asc' } });
  res.json(insumos);
};

export const crearInsumo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { nombre, descripcion, stock, precio } = req.body;
  if (!nombre || precio === undefined) {
    res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' });
    return;
  }
  const insumo = await prisma.insumo.create({
    data: { nombre, descripcion, stock: stock ? Number(stock) : 0, precio: Number(precio) },
  });
  res.status(201).json(insumo);
};

export const actualizarInsumo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const insumo = await prisma.insumo.update({
    where: { id: Number(id) },
    data: { nombre, descripcion, precio: precio ? Number(precio) : undefined },
  });
  res.json(insumo);
};

export const eliminarInsumo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.insumo.delete({ where: { id: Number(id) } });
  res.json({ mensaje: 'Medicamento eliminado correctamente' });
};

export const actualizarStock = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { cantidad } = req.body;
  const insumo = await prisma.insumo.update({
    where: { id: Number(id) },
    data: { stock: { increment: Number(cantidad) } },
  });
  res.json(insumo);
};

export const alertasStock = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const insumos = await prisma.insumo.findMany({
    where: { stock: { lte: 10 } },
    orderBy: { stock: 'asc' },
  });
  res.json(insumos);
};
