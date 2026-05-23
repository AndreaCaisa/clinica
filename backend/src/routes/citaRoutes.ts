import { Router } from 'express';
import { listarCitas, crearCita, actualizarCita, eliminarCitasPasadas } from '../controllers/citaController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/', listarCitas);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.delete('/pasadas', eliminarCitasPasadas);
router.delete('/:id', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.consulta.delete({ where: { id: Number(req.params.id) } });
  res.json({ mensaje: 'Cita eliminada correctamente' });
});

export default router;
