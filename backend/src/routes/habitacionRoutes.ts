import { Router } from 'express';
import { listarHabitaciones, crearHabitacion, ingresarPaciente, darAlta } from '../controllers/habitacionController';
import { verificarToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/', listarHabitaciones);
router.post('/', crearHabitacion);
router.post('/:id/ingresar', ingresarPaciente);
router.put('/:id/alta', darAlta);

export default router;
