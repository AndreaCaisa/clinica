import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Usuario {
  id: number;
  username: string;
  rol: string;
  activo: boolean;
}

const ROLES = [
  { valor: 'administrador', etiqueta: 'Administrador' },
  { valor: 'medico', etiqueta: 'Medico' },
  { valor: 'enfermera', etiqueta: 'Enfermera' },
  { valor: 'farmaceutico', etiqueta: 'Farmaceutico' },
  { valor: 'recepcion', etiqueta: 'Recepcion' },
];

function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevo, setNuevo] = useState({ username: '', password: '', rol: 'medico' });
  const [exito, setExito] = useState('');

  const cargarUsuarios = async () => {
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleCrear = async () => {
    try {
      await api.post('/usuarios', nuevo);
      setMostrarFormulario(false);
      setNuevo({ username: '', password: '', rol: 'medico' });
      setExito('Usuario creado correctamente');
      setTimeout(() => setExito(''), 3000);
      cargarUsuarios();
    } catch {
      alert('Error al crear usuario');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.put('/usuarios/' + id + '/toggle', {});
      cargarUsuarios();
    } catch {
      alert('Error al cambiar estado');
    }
  };

  const colorRol = (rol: string) => {
    const colores: { [key: string]: string } = {
      administrador: 'bg-purple-100 text-purple-700',
      medico: 'bg-blue-100 text-blue-700',
      enfermera: 'bg-green-100 text-green-700',
      farmaceutico: 'bg-yellow-100 text-yellow-700',
      recepcion: 'bg-pink-100 text-pink-700',
    };
    return colores[rol] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Gestion de Usuarios</h2>
      {exito && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{exito}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{usuarios.length} usuarios registrados</p>
        <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo usuario
        </button>
      </div>
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Usuario</label>
              <input type="text" value={nuevo.username} onChange={(e) => setNuevo({ ...nuevo, username: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="nombre de usuario" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contrasena</label>
              <input type="password" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="contrasena" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
              <select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {ROLES.map((r) => (
                  <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                ))}
              </select>
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
              {['Usuario', 'Rol', 'Estado', 'Acceso'].map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorRol(u.rol)}`}>{u.rol}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => handleToggle(u.id)} className={`px-3 py-1 rounded-lg text-xs font-medium ${u.activo ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
