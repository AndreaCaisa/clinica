import { Router } from 'express';
import { crearTriaje, obtenerTriajePaciente } from '../controllers/triajeController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();
router.use(verificarToken);
router.post('/', crearTriaje);
router.get('/:pacienteId', obtenerTriajePaciente);
export default router;

