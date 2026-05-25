import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const listarMedicos = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const medicos = await prisma.medico.findMany({ orderBy: { apellido: 'asc' } });
  res.json(medicos);
};

export const obtenerMedico = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const medico = await prisma.medico.findUnique({ where: { id: Number(id) } });
  if (!medico) { res.status(404).json({ mensaje: 'Medico no encontrado' }); return; }
  res.json(medico);
};

export const crearMedico = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { cedula, nombre, apellido, especialidad, telefono, email } = req.body;
  if (!cedula || !nombre || !apellido || !especialidad) {
    res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    return;
  }
  const existe = await prisma.medico.findUnique({ where: { cedula } });
  if (existe) { res.status(409).json({ mensaje: 'Ya existe un medico con esa cedula' }); return; }
  const medico = await prisma.medico.create({
    data: { cedula, nombre, apellido, especialidad, telefono, email },
  });
  res.status(201).json(medico);
};
