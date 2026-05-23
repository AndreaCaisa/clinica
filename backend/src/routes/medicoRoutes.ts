import { Router } from 'express';
import { listarMedicos, obtenerMedico, crearMedico } from '../controllers/medicoController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();
router.use(verificarToken);
router.get('/', listarMedicos);
router.get('/:id', obtenerMedico);
router.post('/', crearMedico);
export default router;

