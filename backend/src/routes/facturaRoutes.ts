import { Router } from 'express';
import { listarFacturas, crearFactura, pagarFactura, obtenerFacturasPaciente, eliminarFactura, agregarDetalle } from '../controllers/facturaController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/', listarFacturas);
router.get('/paciente/:pacienteId', obtenerFacturasPaciente);
router.post('/', crearFactura);
router.post('/:id/detalle', agregarDetalle);
router.put('/:id/pagar', pagarFactura);
router.delete('/:id', eliminarFactura);

export default router;
