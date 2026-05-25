import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/habitaciones
export const listarHabitaciones = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const habitaciones = await prisma.habitacion.findMany({
    orderBy: { numero: 'asc' },
    include: { hospitalizaciones: { where: { fechaAlta: null } } },
  });
  res.json(habitaciones);
};

// POST /api/habitaciones
export const crearHabitacion = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { numero, tipo } = req.body;

  if (!numero || !tipo) {
    res.status(400).json({ mensaje: 'Numero y tipo son obligatorios' });
    return;
  }

  const existe = await prisma.habitacion.findUnique({ where: { numero } });
  if (existe) {
    res.status(409).json({ mensaje: 'Ya existe una habitacion con ese numero' });
    return;
  }

  const habitacion = await prisma.habitacion.create({
    data: { numero, tipo, disponible: true },
  });

  res.status(201).json(habitacion);
};

// POST /api/habitaciones/:id/ingresar
export const ingresarPaciente = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { pacienteId, medicoId, motivo } = req.body;

  if (!pacienteId || !medicoId || !motivo) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    return;
  }

  await prisma.habitacion.update({
    where: { id: Number(id) },
    data: { disponible: false },
  });

  const hospitalizacion = await prisma.hospitalizacion.create({
    data: {
      pacienteId: Number(pacienteId),
      medicoId: Number(medicoId),
      habitacionId: Number(id),
      motivo,
    },
    include: { medico: true, habitacion: true },
  });

  res.status(201).json(hospitalizacion);
};

// PUT /api/habitaciones/:id/alta
export const darAlta = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  const hospitalizacion = await prisma.hospitalizacion.findFirst({
    where: { habitacionId: Number(id), fechaAlta: null },
  });

  if (!hospitalizacion) {
    res.status(404).json({ mensaje: 'No hay paciente hospitalizado en esta habitacion' });
    return;
  }

  await prisma.hospitalizacion.update({
    where: { id: hospitalizacion.id },
    data: { fechaAlta: new Date() },
  });

  await prisma.habitacion.update({
    where: { id: Number(id) },
    data: { disponible: true },
  });

  res.json({ mensaje: 'Alta registrada correctamente' });
};
