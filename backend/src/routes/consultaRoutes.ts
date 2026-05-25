import { Router } from 'express';
import { obtenerHistoria, crearConsulta, crearReceta } from '../controllers/consultaController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/:pacienteId', obtenerHistoria);
router.post('/', crearConsulta);
router.post('/:id/receta', crearReceta);

export default router;

