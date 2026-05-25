import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Cita {
  id: number;
  fecha: string;
  motivo: string;
  medico: Medico;
  historia: { paciente: Paciente };
}

function Citas() {
  const [searchParams] = useSearchParams();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nueva, setNueva] = useState({
    pacienteId: searchParams.get('pacienteId') || '',
    medicoId: '',
    fecha: '',
    motivo: '',
  });
const cargarDatos = async () => {
    const [cRes, mRes, pRes] = await Promise.all([
      api.get('/citas'),
      api.get('/medicos'),
      api.get('/pacientes'),
    ]);
    setCitas(cRes.data);
    setMedicos(mRes.data);
    setPacientes(pRes.data);
  };

  useEffect(() => {
    cargarDatos();
    if (searchParams.get('pacienteId')) {
      setMostrarFormulario(true);
    }
  }, []);

  const handleCrear = async () => {
    try {
      await api.post('/citas', nueva);
      setMostrarFormulario(false);
      setNueva({ pacienteId: '', medicoId: '', fecha: '', motivo: '' });
      cargarDatos();
    } catch {
      alert('Error al crear cita');
    }
  };

  const handleEliminar = async (id: number) => {
    
    try {
      await api.delete('/citas/' + id);
      cargarDatos();
    } catch {
      alert('Error al eliminar cita');
    }
  };
return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Citas</h2>
          <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nueva cita
          </button>
        </div>
        {mostrarFormulario && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Nueva cita</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
                <select value={nueva.pacienteId} onChange={(e) => setNueva({ ...nueva, pacienteId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Medico</label>
                <select value={nueva.medicoId} onChange={(e) => setNueva({ ...nueva, medicoId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>Dr. {m.nombre} {m.apellido} - {m.especialidad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha y hora</label>
                <input type="datetime-local" value={nueva.fecha} onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Motivo</label>
                <input type="text" value={nueva.motivo} onChange={(e) => setNueva({ ...nueva, motivo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Motivo de consulta" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleCrear} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
              <button type="button" onClick={() => setMostrarFormulario(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-800">
              <tr>
                {['Paciente', 'Medico', 'Especialidad', 'Fecha', 'Motivo', 'Acciones'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citas.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay citas registradas</td></tr>
              ) : citas.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{c.historia.paciente.nombre} {c.historia.paciente.apellido}</td>
                  <td className="px-4 py-3">Dr. {c.medico.nombre} {c.medico.apellido}</td>
                  <td className="px-4 py-3">{c.medico.especialidad}</td>
                  <td className="px-4 py-3">{new Date(c.fecha).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.motivo}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleEliminar(c.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Citas;
