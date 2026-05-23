import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const listarCitas = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { fecha, medicoId } = req.query;
  const citas = await prisma.consulta.findMany({
    where: {
      ...(medicoId ? { medicoId: Number(medicoId) } : {}),
      ...(fecha ? { fecha: { gte: new Date(fecha + 'T00:00:00'), lte: new Date(fecha + 'T23:59:59') } } : {}),
    },
    include: { medico: true, historia: { include: { paciente: true } } },
    orderBy: { fecha: 'asc' },
  });
  res.json(citas);
};

export const crearCita = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { pacienteId, medicoId, fecha, motivo } = req.body;
  if (!pacienteId || !medicoId || !fecha || !motivo) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    return;
  }
  let historia = await prisma.historiaClinica.findFirst({ where: { pacienteId: Number(pacienteId) } });
  if (!historia) {
    historia = await prisma.historiaClinica.create({ data: { pacienteId: Number(pacienteId) } });
  }
  const cita = await prisma.consulta.create({
    data: { historiaId: historia.id, medicoId: Number(medicoId), fecha: new Date(fecha), motivo },
    include: { medico: true, historia: { include: { paciente: true } } },
  });
  res.status(201).json(cita);
};

export const actualizarCita = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const { diagnostico, tratamiento } = req.body;
  const cita = await prisma.consulta.update({
    where: { id: Number(id) },
    data: { diagnostico, tratamiento },
  });
  res.json(cita);
};

export const eliminarCitasPasadas = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const ahora = new Date();
  const resultado = await prisma.consulta.deleteMany({
    where: {
      fecha: { lt: ahora },
      diagnostico: null,
      tratamiento: null,
    },
  });
  res.json({ mensaje: resultado.count + ' citas pasadas eliminadas' });
};
