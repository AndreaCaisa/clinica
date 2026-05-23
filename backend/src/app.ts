import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import medicoRoutes from './routes/medicoRoutes';
import citaRoutes from './routes/citaRoutes';
import triajeRoutes from './routes/triajeRoutes';
import consultaRoutes from './routes/consultaRoutes';
import insumoRoutes from './routes/insumoRoutes';
import habitacionRoutes from './routes/habitacionRoutes';
import facturaRoutes from './routes/facturaRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import despachoRoutes from './routes/despachoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/triaje', triajeRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/despacho', despachoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  process.stdout.write('Servidor en puerto ' + PORT + '\n');
});

export default app;
