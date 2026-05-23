import { Router } from 'express';
import { despacharMedicamento } from '../controllers/despachoController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.post('/', despacharMedicamento);

export default router;
