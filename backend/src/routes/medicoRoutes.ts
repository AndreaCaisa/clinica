import { Router } from 'express';
import { listarMedicos, obtenerMedico, crearMedico } from '../controllers/medicoController';
import { verificarToken } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.use(verificarToken);
router.get('/', listarMedicos);
router.get('/:id', obtenerMedico);
router.post('/', crearMedico);
router.put('/:id', async (req, res) => {
  const { nombre, apellido, especialidad, telefono, email, usuarioId } = req.body;
  const medico = await prisma.medico.update({
    where: { id: Number(req.params.id) },
    data: { 
      nombre, 
      apellido, 
      especialidad, 
      telefono, 
      email,
      usuarioId: usuarioId !== undefined ? (usuarioId ? Number(usuarioId) : null) : undefined,
    },
  });
  res.json(medico);
});
router.delete('/:id', async (req, res) => {
  await prisma.medico.delete({ where: { id: Number(req.params.id) } });
  res.json({ mensaje: 'Medico eliminado correctamente' });
});

export default router;