import { useState, useEffect } from 'react';
import api from '../api/axios';

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

interface Detalle {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

function Consultas() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [form, setForm] = useState({
    pacienteId: '', medicoId: '', motivo: '', diagnostico: '', tratamiento: '',
  });
  const [detalles, setDetalles] = useState<Detalle[]>([
    { medicamento: '', dosis: '', frecuencia: '', duracion: '' },
  ]);
  const [consultaId, setConsultaId] = useState<number | null>(null);
  const [exito, setExito] = useState('');

  useEffect(() => {
    Promise.all([api.get('/pacientes'), api.get('/medicos')]).then(([p, m]) => {
      setPacientes(p.data);
      setMedicos(m.data);
    });
  }, []);

  const handleGuardarConsulta = async () => {
    try {
      const { data } = await api.post('/consultas', form);
      setConsultaId(data.id);
      setExito('Consulta guardada. Ahora puedes agregar la receta.');
    } catch {
      alert('Error al guardar consulta');
    }
  };

  const handleAgregarDetalle = () => {
    setDetalles([...detalles, { medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);
  };

  const handleDetalleChange = (index: number, key: string, value: string) => {
    const nuevos = [...detalles];
    nuevos[index] = { ...nuevos[index], [key]: value };
    setDetalles(nuevos);
  };

  const handleGuardarReceta = async () => {
    try {
      await api.post('/consultas/' + consultaId + '/receta', { detalles });
      setExito('Receta guardada correctamente');
      setConsultaId(null);
      setForm({ pacienteId: '', medicoId: '', motivo: '', diagnostico: '', tratamiento: '' });
      setDetalles([{ medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);
      setTimeout(() => setExito(''), 3000);
    } catch {
      alert('Error al guardar receta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Nueva Consulta</h2>
        {exito && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{exito}</div>
        )}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Datos de la consulta</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
              <select value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Medico</label>
              <select value={form.medicoId} onChange={(e) => setForm({ ...form, medicoId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>Dr. {m.nombre} {m.apellido} - {m.especialidad}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Motivo</label>
              <input type="text" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Motivo de consulta" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Diagnostico</label>
              <input type="text" value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Diagnostico" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Tratamiento</label>
              <input type="text" value={form.tratamiento} onChange={(e) => setForm({ ...form, tratamiento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tratamiento indicado" />
            </div>
          </div>
          {!consultaId && (
            <button type="button" onClick={handleGuardarConsulta} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Guardar consulta
            </button>
          )}
        </div>
        {consultaId && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-4">Receta Digital</h3>
            {detalles.map((d, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 mb-3">
                <input type="text" placeholder="Medicamento" value={d.medicamento} onChange={(e) => handleDetalleChange(i, 'medicamento', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Dosis" value={d.dosis} onChange={(e) => handleDetalleChange(i, 'dosis', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Frecuencia" value={d.frecuencia} onChange={(e) => handleDetalleChange(i, 'frecuencia', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="text" placeholder="Duracion" value={d.duracion} onChange={(e) => handleDetalleChange(i, 'duracion', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleAgregarDetalle} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">
                + Agregar medicamento
              </button>
              <button type="button" onClick={handleGuardarReceta} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Guardar receta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Consultas;
