import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Citas from './pages/Citas';
import Triaje from './pages/Triaje';
import Consultas from './pages/Consultas';
import Historia from './pages/Historia';
import Farmacia from './pages/Farmacia';
import Hospitalizacion from './pages/Hospitalizacion';
import Facturacion from './pages/Facturacion';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Medicos from './pages/Medicos';
import MedicoPanel from './pages/MedicoPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/triaje" element={<Triaje />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/farmacia" element={<Farmacia />} />
        <Route path="/hospitalizacion" element={<Hospitalizacion />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/medico" element={<MedicoPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
