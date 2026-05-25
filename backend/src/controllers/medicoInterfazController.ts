import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const pacientesHoyMedico = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const usuarioId = req.usuario?.id;
  const medico = await prisma.medico.findUnique({ where: { usuarioId } });
  if (!medico) { res.status(404).json({ mensaje: 'No se encontro medico asociado' }); return; }
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
  const consultas = await prisma.consulta.findMany({
    where: { medicoId: medico.id, fecha: { gte: inicioHoy, lte: finHoy } },
    include: { historia: { include: { paciente: true, triajes: { orderBy: { fecha: 'desc' }, take: 1 } } } },
    orderBy: { fecha: 'asc' },
  });
  res.json({ medico, consultas });
};

export const actualizarConsulta = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { diagnostico, tratamiento } = req.body;
  const consulta = await prisma.consulta.update({ where: { id: Number(id) }, data: { diagnostico, tratamiento } });
  res.json(consulta);
};

export const crearRecetaMedico = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { detalles } = req.body;
  if (!detalles || detalles.length === 0) { res.status(400).json({ mensaje: 'La receta debe tener al menos un medicamento' }); return; }
  const receta = await prisma.receta.create({
    data: { consultaId: Number(id), detalles: { create: detalles.map((d: { medicamento: string; dosis: string; frecuencia: string; duracion: string }) => ({ medicamento: d.medicamento, dosis: d.dosis, frecuencia: d.frecuencia, duracion: d.duracion })) } },
    include: { detalles: true },
  });
  res.json(receta);
};

export const historiaPaciente = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { pacienteId } = req.params;
  const historia = await prisma.historiaClinica.findFirst({
    where: { pacienteId: Number(pacienteId) },
    include: { paciente: true, triajes: { orderBy: { fecha: 'desc' }, take: 5 }, consultas: { orderBy: { fecha: 'desc' }, include: { medico: true, recetas: { include: { detalles: true } } } } },
  });
  if (!historia) { res.status(404).json({ mensaje: 'No se encontro historia clinica' }); return; }
  res.json(historia);
};
