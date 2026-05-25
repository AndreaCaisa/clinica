import { Router } from 'express';
import { pacientesHoyMedico, actualizarConsulta, crearRecetaMedico, historiaPaciente } from '../controllers/medicoInterfazController';
import { verificarToken, verificarRol } from '../middleware/authMiddleware';

const router = Router();

router.use(verificarToken);
router.use(verificarRol('medico', 'administrador'));
router.get('/pacientes-hoy', pacientesHoyMedico);
router.put('/consulta/:id', actualizarConsulta);
router.post('/consulta/:id/receta', crearRecetaMedico);
router.get('/paciente/:pacienteId/historia', historiaPaciente);

export default router;