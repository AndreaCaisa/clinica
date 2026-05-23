import { Router } from 'express';
import { listarPacientes, obtenerPaciente, crearPaciente, actualizarPaciente, eliminarPaciente } from '../controllers/pacienteController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/', listarPacientes);
router.get('/:id', obtenerPaciente);
router.post('/', crearPaciente);
router.put('/:id', actualizarPaciente);
router.delete('/:id', eliminarPaciente);

export default router;
