import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Detalle {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

interface Receta {
  id: number;
  detalles: Detalle[];
}

interface Consulta {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  medico: { nombre: string; apellido: string; especialidad: string };
  recetas: Receta[];
}

interface Triaje {
  fecha: string;
  presionArterial: string | null;
  temperatura: number | null;
  peso: number | null;
  talla: number | null;
}

interface Historia {
  paciente: Paciente;
  consultas: Consulta[];
  triajes: Triaje[];
}

function Historia() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api.get('/pacientes').then((res) => setPacientes(res.data));
  }, []);

  const buscarHistoria = async () => {
    if (!pacienteId) return;
    setCargando(true);
    try {
      const { data } = await api.get('/consultas/' + pacienteId);
      setHistoria(data);
    } catch {
      alert('No se encontro historia clinica');
    } finally {
      setCargando(false);
    }
  };

return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Historia Clinica</h2>
      <div className="flex gap-2 mb-6">
        <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm">
          <option value="">Seleccionar paciente...</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
          ))}
        </select>
        <button type="button" onClick={buscarHistoria} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm">
          Ver historia
        </button>
      </div>
      {cargando && <p className="text-center text-gray-500">Cargando...</p>}
      {historia && (
        <div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-1">
              {historia.paciente.nombre} {historia.paciente.apellido}
            </h3>
            <p className="text-sm text-blue-600">Cedula: {historia.paciente.cedula}</p>
          </div>
          {historia.triajes.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <h4 className="font-bold text-gray-700 mb-3">Ultimos signos vitales</h4>
              {historia.triajes.map((t, i) => (
                <div key={i} className="text-sm text-gray-600 grid grid-cols-4 gap-2 border-b py-2">
                  <span>PA: {t.presionArterial || '-'}</span>
                  <span>Temp: {t.temperatura || '-'} C</span>
                  <span>Peso: {t.peso || '-'} kg</span>
                  <span>Talla: {t.talla || '-'} cm</span>
                </div>
              ))}
            </div>
          )}
<div className="bg-white rounded-xl shadow p-4">
            <h4 className="font-bold text-gray-700 mb-3">Consultas ({historia.consultas.length})</h4>
            {historia.consultas.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay consultas registradas</p>
            ) : historia.consultas.map((c) => (
              <div key={c.id} className="border-b py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{c.motivo}</p>
                    <p className="text-sm text-gray-500">Dr. {c.medico.nombre} {c.medico.apellido} - {c.medico.especialidad}</p>
                    <p className="text-xs text-gray-400">{new Date(c.fecha).toLocaleString()}</p>
                  </div>
                </div>
                {c.diagnostico && <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Diagnostico:</span> {c.diagnostico}</p>}
                {c.tratamiento && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Tratamiento:</span> {c.tratamiento}</p>}
                {c.recetas.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 mt-2">
                    <p className="text-sm font-medium text-green-700 mb-2">Receta:</p>
                    {c.recetas[0].detalles.map((d, i) => (
                      <p key={i} className="text-xs text-green-600">
                        {d.medicamento} - {d.dosis} - {d.frecuencia} - {d.duracion}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Historia;

