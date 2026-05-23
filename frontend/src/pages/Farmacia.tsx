import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Insumo {
  id: number;
  nombre: string;
  descripcion: string | null;
  stock: number;
  precio: number;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

function Farmacia() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [alertas, setAlertas] = useState<Insumo[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDespacho, setMostrarDespacho] = useState(false);
  const [editando, setEditando] = useState<Insumo | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', stock: '', precio: '' });
  const [despacho, setDespacho] = useState({ pacienteId: '', insumoId: '', cantidad: '' });
  const [stockExtra, setStockExtra] = useState<{ [key: number]: string }>({});
  const [exito, setExito] = useState('');
const cargarDatos = async () => {
    const [iRes, aRes, pRes] = await Promise.all([
      api.get('/insumos'),
      api.get('/insumos/alertas'),
      api.get('/pacientes'),
    ]);
    setInsumos(iRes.data);
    setAlertas(aRes.data);
    setPacientes(pRes.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear = async () => {
    try {
      await api.post('/insumos', nuevo);
      setMostrarFormulario(false);
      setNuevo({ nombre: '', descripcion: '', stock: '', precio: '' });
      cargarDatos();
    } catch {
      alert('Error al crear medicamento');
    }
  };

  const handleActualizar = async () => {
    if (!editando) return;
    try {
      await api.put('/insumos/' + editando.id, {
        nombre: editando.nombre,
        descripcion: editando.descripcion,
        precio: editando.precio,
      });
      setEditando(null);
      cargarDatos();
    } catch {
      alert('Error al actualizar medicamento');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('Seguro que deseas eliminar este medicamento?')) return;
    try {
      await api.delete('/insumos/' + id);
      cargarDatos();
    } catch {
      alert('Error al eliminar medicamento');
    }
  };

  const handleAgregarStock = async (id: number) => {
    try {
      await api.put('/insumos/' + id + '/stock', { cantidad: Number(stockExtra[id] || 0) });
      setStockExtra({ ...stockExtra, [id]: '' });
      cargarDatos();
    } catch {
      alert('Error al actualizar stock');
    }
  };

  const handleDespacho = async () => {
    try {
      const { data } = await api.post('/despacho', despacho);
      setMostrarDespacho(false);
      setDespacho({ pacienteId: '', insumoId: '', cantidad: '' });
      setExito('Despachado. Factura #' + data.factura.id + ' generada por $' + data.factura.total.toFixed(2));
      setTimeout(() => setExito(''), 5000);
      cargarDatos();
    } catch {
      alert('Error al despachar medicamento');
    }
  };
return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Farmacia e Inventario</h2>
      {exito && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{exito}</div>
      )}
      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium mb-2">Alertas de stock bajo:</p>
          {alertas.map((a) => (
            <p key={a.id} className="text-sm text-red-600">{a.nombre} — Stock: {a.stock} unidades</p>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{insumos.length} medicamentos registrados</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMostrarDespacho(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Despachar medicamento
          </button>
          <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nuevo medicamento
          </button>
        </div>
      </div>
      {mostrarDespacho && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-green-500">
          <h3 className="font-bold text-gray-700 mb-4">Despachar medicamento a paciente</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
              <select value={despacho.pacienteId} onChange={(e) => setDespacho({ ...despacho, pacienteId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Medicamento</label>
              <select value={despacho.insumoId} onChange={(e) => setDespacho({ ...despacho, insumoId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre} (Stock: {i.stock}) - ${i.precio.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cantidad</label>
              <input type="number" value={despacho.cantidad} onChange={(e) => setDespacho({ ...despacho, cantidad: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleDespacho} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Confirmar despacho</button>
            <button type="button" onClick={() => setMostrarDespacho(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Nuevo medicamento</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nombre', key: 'nombre', type: 'text' },
              { label: 'Descripcion', key: 'descripcion', type: 'text' },
              { label: 'Stock inicial', key: 'stock', type: 'number' },
              { label: 'Precio', key: 'precio', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={nuevo[key as keyof typeof nuevo]} onChange={(e) => setNuevo({ ...nuevo, [key]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCrear} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
            <button type="button" onClick={() => setMostrarFormulario(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
{editando && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-yellow-500">
          <h3 className="font-bold text-gray-700 mb-4">Editar medicamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripcion</label>
              <input type="text" value={editando.descripcion || ''} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Precio</label>
              <input type="number" value={editando.precio} onChange={(e) => setEditando({ ...editando, precio: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
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
              {['Medicamento', 'Stock', 'Precio', 'Agregar stock', 'Acciones'].map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {insumos.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No hay medicamentos registrados</td></tr>
            ) : insumos.map((i) => (
              <tr key={i.id} className={i.stock <= 10 ? "border-t bg-red-50" : "border-t hover:bg-gray-50"}>
                <td className="px-4 py-3">
                  <p className="font-medium">{i.nombre}</p>
                  {i.descripcion && <p className="text-xs text-gray-400">{i.descripcion}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={i.stock <= 10 ? "font-bold text-red-600" : "font-bold text-green-600"}>{i.stock}</span>
                </td>
                <td className="px-4 py-3 font-medium">${i.precio.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <input type="number" value={stockExtra[i.id] || ''} onChange={(e) => setStockExtra({ ...stockExtra, [i.id]: e.target.value })} className="w-16 border rounded-lg px-2 py-1 text-sm" placeholder="0" />
                    <button type="button" onClick={() => handleAgregarStock(i.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">+</button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditando(i)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-lg text-xs font-medium">Editar</button>
                    <button type="button" onClick={() => handleEliminar(i.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-medium">Eliminar</button>
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

export default Farmacia;
