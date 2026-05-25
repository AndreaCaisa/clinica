import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Usuario {
  id: number;
  username: string;
  rol: string;
}

interface Medico {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string | null;
  email: string | null;
  usuarioId: number | null;
}

const ESPECIALIDADES = [
  'Medicina General', 'Pediatria', 'Ginecologia', 'Odontologia',
  'Psicologia', 'Cardiologia', 'Neurologia', 'Traumatologia',
  'Dermatologia', 'Oftalmologia', 'Urologia', 'Endocrinologia',
];

function Medicos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Medico | null>(null);
  const [nuevo, setNuevo] = useState({
    cedula: '', nombre: '', apellido: '',
    especialidad: 'Medicina General', telefono: '', email: '',
  });

  const cargarMedicos = async () => {
    const { data: uData } = await api.get('/usuarios');
    setUsuarios(uData.filter((u: Usuario) => u.rol === 'medico'));
    const { data } = await api.get('/medicos');
    setMedicos(data);
  };

  useEffect(() => { cargarMedicos(); }, []);

  const handleCrear = async () => {
    try {
      await api.post('/medicos', nuevo);
      setMostrarFormulario(false);
      setNuevo({ cedula: '', nombre: '', apellido: '', especialidad: 'Medicina General', telefono: '', email: '' });
      cargarMedicos();
    } catch {
      alert('Error al crear medico');
    }
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await api.put('/medicos/' + editando.id, editando);
      setEditando(null);
      cargarMedicos();
    } catch {
      alert('Error al actualizar medico');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.delete('/medicos/' + id);
      cargarMedicos();
    } catch {
      alert('Error al eliminar medico');
    }
  };

  const handleVincularUsuario = async (medicoId: number, usuarioId: string) => {
    try {
      await api.put('/medicos/' + medicoId, { usuarioId: usuarioId ? Number(usuarioId) : null });
      cargarMedicos();
    } catch {
      alert('Error al vincular usuario');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gestion de Medicos</h2>
        <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo medico
        </button>
      </div>
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Nuevo medico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cedula</label>
              <input type="text" value={nuevo.cedula} onChange={(e) => setNuevo({ ...nuevo, cedula: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="10 digitos" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input type="text" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
              <input type="text" value={nuevo.apellido} onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Especialidad</label>
              <select value={nuevo.especialidad} onChange={(e) => setNuevo({ ...nuevo, especialidad: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefono</label>
              <input type="text" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCrear} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
            <button type="button" onClick={() => setMostrarFormulario(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      {editando && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-yellow-500">
          <h3 className="font-bold text-gray-700 mb-4">Editar medico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
              <input type="text" value={editando.apellido} onChange={(e) => setEditando({ ...editando, apellido: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Especialidad</label>
              <select value={editando.especialidad} onChange={(e) => setEditando({ ...editando, especialidad: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefono</label>
              <input type="text" value={editando.telefono || ''} onChange={(e) => setEditando({ ...editando, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={editando.email || ''} onChange={(e) => setEditando({ ...editando, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleActualizar} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Actualizar</button>
            <button type="button" onClick={() => setEditando(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              {['Cedula', 'Nombre', 'Apellido', 'Especialidad', 'Telefono', 'Usuario', 'Acciones'].map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {medicos.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No hay medicos registrados</td></tr>
            ) : medicos.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{m.cedula}</td>
                <td className="px-4 py-3">{m.nombre}</td>
                <td className="px-4 py-3">{m.apellido}</td>
                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{m.especialidad}</span></td>
                <td className="px-4 py-3">{m.telefono || '-'}</td>
                <td className="px-4 py-3">
                  <select value={m.usuarioId || ''} onChange={(e) => handleVincularUsuario(m.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                    <option value="">Sin usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditando(m)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs">Editar</button>
                    <button type="button" onClick={() => handleEliminar(m.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Medicos;