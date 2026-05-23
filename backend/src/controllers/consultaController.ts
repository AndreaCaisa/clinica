import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/consultas/:pacienteId
export const obtenerHistoria = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { pacienteId } = req.params;

  const historia = await prisma.historiaClinica.findFirst({
    where: { pacienteId: Number(pacienteId) },
    include: {
      paciente: true,
      triajes: { orderBy: { fecha: 'desc' }, take: 3 },
      consultas: {
        orderBy: { fecha: 'desc' },
        include: {
          medico: true,
          recetas: { include: { detalles: true } },
        },
      },
    },
  });

  if (!historia) {
    res.status(404).json({ mensaje: 'No se encontro historia clinica' });
    return;
  }

  res.json(historia);
};

// POST /api/consultas
export const crearConsulta = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { pacienteId, medicoId, motivo, diagnostico, tratamiento } = req.body;

  if (!pacienteId || !medicoId || !motivo) {
    res.status(400).json({ mensaje: 'Paciente, medico y motivo son obligatorios' });
    return;
  }

  let historia = await prisma.historiaClinica.findFirst({
    where: { pacienteId: Number(pacienteId) },
  });

  if (!historia) {
    historia = await prisma.historiaClinica.create({
      data: { pacienteId: Number(pacienteId) },
    });
  }

  const consulta = await prisma.consulta.create({
    data: {
      historiaId: historia.id,
      medicoId: Number(medicoId),
      motivo,
      diagnostico,
      tratamiento,
      fecha: new Date(),
    },
    include: { medico: true },
  });

  res.status(201).json(consulta);
};

// POST /api/consultas/:id/receta
export const crearReceta = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    res.status(400).json({ mensaje: 'La receta debe tener al menos un medicamento' });
    return;
  }

  const receta = await prisma.receta.create({
    data: {
      consultaId: Number(id),
      detalles: {
        create: detalles.map((d: {
          medicamento: string;
          dosis: string;
          frecuencia: string;
          duracion: string;
        }) => ({
          medicamento: d.medicamento,
          dosis: d.dosis,
          frecuencia: d.frecuencia,
          duracion: d.duracion,
        })),
      },
    },
    include: { detalles: true },
  });

  res.status(201).json(receta);
};

