import { Router } from 'express';
import { listarInsumos, crearInsumo, actualizarInsumo, eliminarInsumo, actualizarStock, alertasStock } from '../controllers/insumoController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/alertas', alertasStock);
router.get('/', listarInsumos);
router.post('/', crearInsumo);
router.put('/:id', actualizarInsumo);
router.put('/:id/stock', actualizarStock);
router.delete('/:id', eliminarInsumo);

export default router;
