import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/pacientes
export const listarPacientes = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { buscar } = req.query;

  const pacientes = await prisma.paciente.findMany({
    where: buscar
      ? {
          OR: [
            { nombre: { contains: buscar as string, mode: 'insensitive' } },
            { apellido: { contains: buscar as string, mode: 'insensitive' } },
            { cedula: { contains: buscar as string } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
  });

  res.json(pacientes);
};

// GET /api/pacientes/:id
export const obtenerPaciente = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  const paciente = await prisma.paciente.findUnique({
    where: { id: Number(id) },
    include: { historias: true },
  });

  if (!paciente) {
    res.status(404).json({ mensaje: 'Paciente no encontrado' });
    return;
  }

  res.json(paciente);
};

// POST /api/pacientes
export const crearPaciente = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const {
    cedula,
    nombre,
    apellido,
    fechaNacimiento,
    telefono,
    direccion,
    email,
  } = req.body;

  if (!cedula || !nombre || !apellido || !fechaNacimiento) {
    res.status(400).json({ mensaje: 'Cédula, nombre, apellido y fecha de nacimiento son obligatorios' });
    return;
  }

  const existe = await prisma.paciente.findUnique({ where: { cedula } });

  if (existe) {
    res.status(409).json({ mensaje: 'Ya existe un paciente con esa cédula' });
    return;
  }

  const paciente = await prisma.paciente.create({
    data: {
      cedula,
      nombre,
      apellido,
      fechaNacimiento: new Date(fechaNacimiento),
      telefono,
      direccion,
      email,
    },
  });

  res.status(201).json(paciente);
};

// PUT /api/pacientes/:id
export const actualizarPaciente = async (
  req: RequestConUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    fechaNacimiento,
    telefono,
    direccion,
    email,
  } = req.body;

  const paciente = await prisma.paciente.update({
    where: { id: Number(id) },
    data: {
      nombre,
      apellido,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      telefono,
      direccion,
      email,
    },
  });

  res.json(paciente);

};
export const eliminarPaciente = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;
  const historias = await prisma.historiaClinica.findMany({
    where: { pacienteId: Number(id) },
    include: { consultas: { include: { recetas: { include: { detalles: true } } } }, triajes: true },
  });
  for (const historia of historias) {
    for (const consulta of historia.consultas) {
      for (const receta of consulta.recetas) {
        await prisma.detalleReceta.deleteMany({ where: { recetaId: receta.id } });
      }
      await prisma.receta.deleteMany({ where: { consultaId: consulta.id } });
    }
    await prisma.consulta.deleteMany({ where: { historiaId: historia.id } });
    await prisma.triaje.deleteMany({ where: { historiaId: historia.id } });
  }
  await prisma.historiaClinica.deleteMany({ where: { pacienteId: Number(id) } });
  await prisma.detalleFactura.deleteMany({ where: { factura: { pacienteId: Number(id) } } });
  await prisma.factura.deleteMany({ where: { pacienteId: Number(id) } });
  await prisma.paciente.delete({ where: { id: Number(id) } });
  res.json({ mensaje: 'Paciente eliminado correctamente' });

};
