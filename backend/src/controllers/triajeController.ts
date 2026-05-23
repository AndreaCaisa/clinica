import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const crearTriaje = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { pacienteId, presionArterial, temperatura, peso, talla, frecuenciaCardiaca } = req.body;
  if (!pacienteId) {
    res.status(400).json({ mensaje: 'ID del paciente es obligatorio' });
    return;
  }
  let historia = await prisma.historiaClinica.findFirst({ where: { pacienteId: Number(pacienteId) } });
  if (!historia) {
    historia = await prisma.historiaClinica.create({ data: { pacienteId: Number(pacienteId) } });
  }
  const imc = peso && talla ? Number((peso / ((talla / 100) ** 2)).toFixed(2)) : null;
  const triaje = await prisma.triaje.create({
    data: {
      historiaId: historia.id,
      presionArterial,
      temperatura: temperatura ? Number(temperatura) : null,
      peso: peso ? Number(peso) : null,
      talla: talla ? Number(talla) : null,
      frecuenciaCardiaca: frecuenciaCardiaca ? Number(frecuenciaCardiaca) : null,
    },
  });
  res.status(201).json({ ...triaje, imc });
};

export const obtenerTriajePaciente = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { pacienteId } = req.params;
  const historia = await prisma.historiaClinica.findFirst({
    where: { pacienteId: Number(pacienteId) },
    include: { triajes: { orderBy: { fecha: 'desc' }, take: 5 } },
  });
  if (!historia) { res.status(404).json({ mensaje: 'No se encontro historia clinica' }); return; }
  res.json(historia.triajes);
};


export const pacientesHoy = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

  const citasHoy = await prisma.consulta.findMany({
    where: { fecha: { gte: inicioHoy, lte: finHoy } },
    include: {
      historia: {
        include: {
          paciente: true,
          triajes: { where: { fecha: { gte: inicioHoy } } },
        },
      },
      medico: true,
    },
    orderBy: { fecha: 'asc' },
  });

  const pacientes = citasHoy.map((c) => ({
    id: c.historia.paciente.id,
    nombre: c.historia.paciente.nombre,
    apellido: c.historia.paciente.apellido,
    cedula: c.historia.paciente.cedula,
    horaCita: c.fecha,
    medico: c.medico.nombre + ' ' + c.medico.apellido,
    especialidad: c.medico.especialidad,
    tieneTriaje: c.historia.triajes.length > 0,
  }));

  const unicos = pacientes.filter(
    (p, index, self) => index === self.findIndex((t) => t.id === p.id),
  );

  res.json(unicos);
};
