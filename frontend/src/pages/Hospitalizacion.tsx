import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  disponible: boolean;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
}

function Hospitalizacion() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [mostrarFormHabitacion, setMostrarFormHabitacion] = useState(false);
  const [mostrarFormIngreso, setMostrarFormIngreso] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<number | null>(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState({ numero: '', tipo: 'individual' });
  const [ingreso, setIngreso] = useState({ pacienteId: '', medicoId: '', motivo: '' });

  const cargarDatos = async () => {
    const [hRes, pRes, mRes] = await Promise.all([
      api.get('/habitaciones'),
      api.get('/pacientes'),
      api.get('/medicos'),
    ]);
    setHabitaciones(hRes.data);
    setPacientes(pRes.data);
    setMedicos(mRes.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrearHabitacion = async () => {
    try {
      await api.post('/habitaciones', nuevaHabitacion);
      setMostrarFormHabitacion(false);
      setNuevaHabitacion({ numero: '', tipo: 'individual' });
      cargarDatos();
    } catch {
      alert('Error al crear habitacion');
    }
  };

  const handleIngresar = async () => {
    try {
      await api.post('/habitaciones/' + habitacionSeleccionada + '/ingresar', ingreso);
      setMostrarFormIngreso(false);
      setIngreso({ pacienteId: '', medicoId: '', motivo: '' });
      cargarDatos();
    } catch {
      alert('Error al ingresar paciente');
    }
  };

  const handleAlta = async (id: number) => {
    try {
      await api.put('/habitaciones/' + id + '/alta', {});
      cargarDatos();
    } catch {
      alert('Error al dar alta');
    }
  };

  const disponibles = habitaciones.filter((h) => h.disponible).length;
  const ocupadas = habitaciones.filter((h) => !h.disponible).length;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Hospitalizacion</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{habitaciones.length}</p>
          <p className="text-sm text-blue-600">Total habitaciones</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{disponibles}</p>
          <p className="text-sm text-green-600">Disponibles</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{ocupadas}</p>
          <p className="text-sm text-red-600">Ocupadas</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700">Mapa de habitaciones</h3>
        <button type="button" onClick={() => setMostrarFormHabitacion(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm">
          + Nueva habitacion
        </button>
      </div>
      {mostrarFormHabitacion && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Numero</label>
              <input type="text" value={nuevaHabitacion.numero} onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, numero: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={nuevaHabitacion.tipo} onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="individual">Individual</option>
                <option value="compartida">Compartida</option>
                <option value="UCI">UCI</option>
                <option value="pediatrica">Pediatrica</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCrearHabitacion} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Guardar</button>
            <button type="button" onClick={() => setMostrarFormHabitacion(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      {mostrarFormIngreso && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h4 className="font-bold text-gray-700 mb-3">Ingresar paciente</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
              <select value={ingreso.pacienteId} onChange={(e) => setIngreso({ ...ingreso, pacienteId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Medico</label>
              <select value={ingreso.medicoId} onChange={(e) => setIngreso({ ...ingreso, medicoId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>Dr. {m.nombre} {m.apellido}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Motivo</label>
              <input type="text" value={ingreso.motivo} onChange={(e) => setIngreso({ ...ingreso, motivo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleIngresar} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Ingresar</button>
            <button type="button" onClick={() => setMostrarFormIngreso(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {habitaciones.map((h) => (
          <div key={h.id} className={h.disponible ? "rounded-xl p-4 border-2 border-green-300 bg-green-50" : "rounded-xl p-4 border-2 border-red-300 bg-red-50"}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-gray-800">Hab. {h.numero}</p>
                <p className="text-xs text-gray-500">{h.tipo}</p>
              </div>
              <span className={h.disponible ? "text-xs px-2 py-1 rounded-full font-medium bg-green-200 text-green-800" : "text-xs px-2 py-1 rounded-full font-medium bg-red-200 text-red-800"}>
                {h.disponible ? 'Disponible' : 'Ocupada'}
              </span>
            </div>
            {h.disponible ? (
              <button type="button" onClick={() => { setHabitacionSeleccionada(h.id); setMostrarFormIngreso(true); }} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-lg text-xs">
                Ingresar paciente
              </button>
            ) : (
              <button type="button" onClick={() => handleAlta(h.id)} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-1 rounded-lg text-xs">
                Dar alta
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hospitalizacion;
