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

interface ItemDespacho {
  insumoId: string;
  cantidad: number;
}

function Farmacia() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [alertas, setAlertas] = useState<Insumo[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDespacho, setMostrarDespacho] = useState(false);
  const [editando, setEditando] = useState<Insumo | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', stock: '', precio: '' });
  const [pacienteDespacho, setPacienteDespacho] = useState('');
  const [itemsDespacho, setItemsDespacho] = useState<ItemDespacho[]>([{ insumoId: '', cantidad: 1 }]);
  const [stockExtra, setStockExtra] = useState<{ [key: number]: string }>({});
  const [exito, setExito] = useState('');

  const cargarDatos = async () => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString();
    const [iRes, aRes, cRes] = await Promise.all([
      api.get('/insumos'),
      api.get('/insumos/alertas'),
      api.get('/citas', { params: { fechaInicio: inicioHoy, fechaFin: finHoy } }),
    ]);
    setInsumos(iRes.data);
    setAlertas(aRes.data);
    const pacientesHoy = cRes.data.map((c: { historia: { paciente: Paciente } }) => c.historia.paciente);
    const unicos = pacientesHoy.filter((p: Paciente, index: number, self: Paciente[]) =>
      index === self.findIndex((t) => t.id === p.id)
    );
    setPacientes(unicos);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 30000);
    return () => clearInterval(intervalo);
  }, []);

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
      await api.put('/insumos/' + editando.id, { nombre: editando.nombre, descripcion: editando.descripcion, precio: editando.precio });
      setEditando(null);
      cargarDatos();
    } catch {
      alert('Error al actualizar medicamento');
    }
  };

  const handleEliminar = async (id: number) => {
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

  const handleAgregarItem = () => {
    setItemsDespacho([...itemsDespacho, { insumoId: '', cantidad: 1 }]);
  };

  const handleItemChange = (index: number, key: string, value: string) => {
    const nuevos = [...itemsDespacho];
    nuevos[index] = { ...nuevos[index], [key]: key === 'cantidad' ? Number(value) : value };
    setItemsDespacho(nuevos);
  };

  const handleEliminarItem = (index: number) => {
    setItemsDespacho(itemsDespacho.filter((_, i) => i !== index));
  };

  const handleDespacho = async () => {
    if (!pacienteDespacho) { alert('Selecciona un paciente'); return; }
    const itemsValidos = itemsDespacho.filter((i) => i.insumoId && i.cantidad > 0);
    if (itemsValidos.length === 0) { alert('Agrega al menos un medicamento'); return; }
    try {
      const { data } = await api.post('/despacho', {
        pacienteId: pacienteDespacho,
        items: itemsValidos,
      });
      setMostrarDespacho(false);
      setPacienteDespacho('');
      setItemsDespacho([{ insumoId: '', cantidad: 1 }]);
      setExito('Despachado. Factura #' + data.factura.id + ' generada por $' + data.factura.total.toFixed(2));
      setTimeout(() => setExito(''), 5000);
      cargarDatos();
    } catch {
      alert('Error al despachar medicamentos');
    }
  };

  const totalDespacho = itemsDespacho.reduce((acc, item) => {
    const insumo = insumos.find((i) => i.id === Number(item.insumoId));
    return acc + (insumo ? insumo.precio * item.cantidad : 0);
  }, 0);

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
            Despachar medicamentos
          </button>
          <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nuevo medicamento
          </button>
        </div>
      </div>
      {mostrarDespacho && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-green-500">
          <h3 className="font-bold text-gray-700 mb-4">Despachar medicamentos</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Paciente </label>
            <select value={pacienteDespacho} onChange={(e) => setPacienteDespacho(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-600">Medicamentos</label>
              <button type="button" onClick={handleAgregarItem} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded">+ Agregar medicamento</button>
            </div>
            {itemsDespacho.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-center">
                <select value={item.insumoId} onChange={(e) => handleItemChange(i, 'insumoId', e.target.value)} className="col-span-2 border rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar medicamento...</option>
                  {insumos.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.nombre} (Stock: {ins.stock}) — ${ins.precio.toFixed(2)}</option>
                  ))}
                </select>
                <div className="flex gap-1 items-center">
                  <input type="number" min="1" value={item.cantidad} onChange={(e) => handleItemChange(i, 'cantidad', e.target.value)} className="w-20 border rounded-lg px-2 py-2 text-sm" placeholder="Cant." />
                  {itemsDespacho.length > 1 && (
                    <button type="button" onClick={() => handleEliminarItem(i)} className="text-red-500 hover:text-red-700 text-lg font-bold px-1">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button type="button" onClick={handleDespacho} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Confirmar despacho</button>
              <button type="button" onClick={() => { setMostrarDespacho(false); setPacienteDespacho(''); setItemsDespacho([{ insumoId: '', cantidad: 1 }]); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
            </div>
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
              <tr key={i.id} className={i.stock <= 10 ? 'border-t bg-red-50' : 'border-t hover:bg-gray-50'}>
                <td className="px-4 py-3">
                  <p className="font-medium">{i.nombre}</p>
                  {i.descripcion && <p className="text-xs text-gray-400">{i.descripcion}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={i.stock <= 10 ? 'font-bold text-red-600' : 'font-bold text-green-600'}>{i.stock}</span>
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