import { Router } from 'express';
import { obtenerDashboard } from '../controllers/dashboardController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/', obtenerDashboard);

export default router;
