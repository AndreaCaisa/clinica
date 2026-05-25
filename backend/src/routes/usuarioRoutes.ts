import { Router } from 'express';
import { listarUsuarios, crearUsuario, toggleUsuario } from '../controllers/usuarioController';
import { verificarToken, verificarRol } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.use(verificarRol('administrador'));
router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id/toggle', toggleUsuario);

export default router;
