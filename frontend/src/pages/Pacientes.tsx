import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string | null;
  email: string | null;
}

interface NavLink {
  href: string;
  label: string;
  roles: string[];
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['administrador'] },
  { href: '/usuarios', label: 'Usuarios', roles: ['administrador'] },
  { href: '/pacientes', label: 'Pacientes', roles: ['administrador', 'medico', 'recepcion'] },
  { href: '/citas', label: 'Citas', roles: ['administrador', 'medico', 'recepcion'] },
  { href: '/triaje', label: 'Triaje', roles: ['administrador', 'enfermera'] },
  { href: '/consultas', label: 'Consultas', roles: ['administrador', 'medico'] },
  { href: '/historia', label: 'Historia', roles: ['administrador', 'medico', 'enfermera'] },
  { href: '/farmacia', label: 'Farmacia', roles: ['administrador', 'farmaceutico'] },
  { href: '/hospitalizacion', label: 'Hospitalizacion', roles: ['administrador', 'enfermera'] },
  { href: '/facturacion', label: 'Facturacion', roles: ['administrador', 'recepcion'] },
];
function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [nuevo, setNuevo] = useState({
    cedula: '', nombre: '', apellido: '',
    fechaNacimiento: '', telefono: '', email: '',
  });
  const [errores, setErrores] = useState<{ cedula?: string; telefono?: string }>({});
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const rol = usuario.rol || '';
  const linksVisibles = NAV_LINKS.filter((l) => l.roles.includes(rol));

  const cargarPacientes = useCallback(async (termino = '') => {
    setCargando(true);
    try {
      const { data } = await api.get('/pacientes', {
        params: termino ? { buscar: termino } : {},
      });
      setPacientes(data);
    } catch {
      navigate('/');
    } finally {
      setCargando(false);
    }
  }, [navigate]);

  useEffect(() => { cargarPacientes(); }, [cargarPacientes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes(buscar);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscar, cargarPacientes]);

  const validar = (data: typeof nuevo) => {
    const nuevosErrores: { cedula?: string; telefono?: string } = {};
    if (!/^\d{10}$/.test(data.cedula)) {
      nuevosErrores.cedula = 'La cedula debe tener exactamente 10 digitos numericos';
    }
    if (data.telefono && !/^\d{10}$/.test(data.telefono)) {
      nuevosErrores.telefono = 'El telefono debe tener exactamente 10 digitos numericos';
    }
    return nuevosErrores;
  };

  const handleCrear = async () => {
    const erroresVal = validar(nuevo);
    if (Object.keys(erroresVal).length > 0) {
      setErrores(erroresVal);
      return;
    }
    try {
      await api.post('/pacientes', nuevo);
      setMostrarFormulario(false);
      setNuevo({ cedula: '', nombre: '', apellido: '', fechaNacimiento: '', telefono: '', email: '' });
      setErrores({});
      cargarPacientes();
    } catch {
      alert('Error al crear paciente');
    }
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await api.put('/pacientes/' + editando.id, editando);
      setEditando(null);
      cargarPacientes();
    } catch {
      alert('Error al actualizar paciente');
    }
  };

  const handleEliminar = async (id: number) => {
    
    try {
      await api.delete('/pacientes/' + id);
      cargarPacientes();
    } catch {
      alert('Error al eliminar paciente');
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  const soloNumeros = (valor: string, key: string) => {
    const soloDigitos = valor.replace(/\D/g, '').slice(0, 10);
    setNuevo({ ...nuevo, [key]: soloDigitos });
  };
return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-sm font-bold">Clinica Nuevo Amanecer</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">{rol}</span>
            <button type="button" onClick={cerrarSesion} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg">
              Cerrar sesion
            </button>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {linksVisibles.map((l) => (
            <a key={l.href} href={l.href} className="text-xs hover:text-blue-200">{l.label}</a>
          ))}
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pacientes</h2>
          <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nuevo paciente
          </button>
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, apellido o cedula..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {mostrarFormulario && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Nuevo paciente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Cedula</label>
                <input type="text" value={nuevo.cedula} onChange={(e) => soloNumeros(e.target.value, 'cedula')} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="10 digitos" maxLength={10} />
                {errores.cedula && <p className="text-red-500 text-xs mt-1">{errores.cedula}</p>}
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha nacimiento</label>
                <input type="date" value={nuevo.fechaNacimiento} onChange={(e) => setNuevo({ ...nuevo, fechaNacimiento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Telefono</label>
                <input type="text" value={nuevo.telefono} onChange={(e) => soloNumeros(e.target.value, 'telefono')} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="10 digitos" maxLength={10} />
                {errores.telefono && <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleCrear} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
              <button type="button" onClick={() => { setMostrarFormulario(false); setErrores({}); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        )}
{editando && (
          <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-gray-700 mb-4">Editar paciente</h3>
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
        {cargando ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  {['Cedula', 'Nombre', 'Apellido', 'Telefono', 'Email', 'Acciones'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pacientes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay pacientes registrados</td></tr>
                ) : pacientes.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{p.cedula}</td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.apellido}</td>
                    <td className="px-4 py-3">{p.telefono || '-'}</td>
                    <td className="px-4 py-3">{p.email || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setEditando(p)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs">Editar</button>
                        <button type="button" onClick={() => handleEliminar(p.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs">Eliminar</button>
                        <button type="button" onClick={() => navigate('/citas?pacienteId=' + p.id)} className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs">+ Cita</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pacientes;
