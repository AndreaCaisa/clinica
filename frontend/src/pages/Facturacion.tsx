import { useState, useEffect } from 'react';
import api from '../api/axios';

interface DetalleFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Factura {
  id: number;
  fecha: string;
  total: number;
  pagada: boolean;
  paciente: Paciente;
  detalles: DetalleFactura[];
}

function Facturacion() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [facturaExpandida, setFacturaExpandida] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [detalles, setDetalles] = useState([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
const cargarDatos = async () => {
    const [fRes, pRes] = await Promise.all([
      api.get('/facturas'),
      api.get('/pacientes'),
    ]);
    setFacturas(fRes.data);
    setPacientes(pRes.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear = async () => {
    try {
      await api.post('/facturas', { pacienteId, detalles });
      setMostrarFormulario(false);
      setPacienteId('');
      setDetalles([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
      cargarDatos();
    } catch {
      alert('Error al crear factura');
    }
  };

  const handlePagar = async (id: number) => {
    try {
      await api.put('/facturas/' + id + '/pagar', {});
      cargarDatos();
    } catch {
      alert('Error al registrar pago');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.delete('/facturas/' + id);
      cargarDatos();
    } catch {
      alert('Error al eliminar factura');
    }
  };

  const [nuevoCargo, setNuevoCargo] = useState({ facturaId: 0, descripcion: '', cantidad: 1, precioUnitario: 0 });
  const handleAgregarCargo = async () => {
    try {
      await api.post('/facturas/' + nuevoCargo.facturaId + '/detalle', nuevoCargo);
      setNuevoCargo({ facturaId: 0, descripcion: '', cantidad: 1, precioUnitario: 0 });
      cargarDatos();
    } catch {
      alert('Error al agregar cargo');
    }
  };
  const totalFormulario = detalles.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0);
return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Facturacion</h2>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{facturas.length} facturas emitidas</p>
        <button type="button" onClick={() => setMostrarFormulario(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nueva factura
        </button>
      </div>
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4">Nueva factura</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
            <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
              ))}
            </select>
          </div>
          <h4 className="font-medium text-gray-700 mb-2">Servicios adicionales</h4>
          {detalles.map((d, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-2">
              <input type="text" placeholder="Descripcion" value={d.descripcion} onChange={(e) => { const n = [...detalles]; n[i] = { ...n[i], descripcion: e.target.value }; setDetalles(n); }} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Cantidad" value={d.cantidad} onChange={(e) => { const n = [...detalles]; n[i] = { ...n[i], cantidad: Number(e.target.value) }; setDetalles(n); }} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Precio" value={d.precioUnitario} onChange={(e) => { const n = [...detalles]; n[i] = { ...n[i], precioUnitario: Number(e.target.value) }; setDetalles(n); }} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setDetalles([...detalles, { descripcion: '', cantidad: 1, precioUnitario: 0 }])} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              + Agregar detalle
            </button>
            <p className="font-bold text-gray-800 text-lg">Total: ${totalFormulario.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCrear} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Emitir factura</button>
            <button type="button" onClick={() => setMostrarFormulario(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              {['N°', 'Paciente', 'Fecha', 'Total', 'Estado', 'Acciones'].map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay facturas emitidas</td></tr>
            ) : facturas.map((f) => (
              <>
                <tr key={f.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setFacturaExpandida(facturaExpandida === f.id ? null : f.id)}>
                  <td className="px-4 py-3 text-blue-600 font-medium">#{f.id}</td>
                  <td className="px-4 py-3 font-medium">{f.paciente.nombre} {f.paciente.apellido}</td>
                  <td className="px-4 py-3">{new Date(f.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold">${f.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={f.pagada ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700' : 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700'}>
                      {f.pagada ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {!f.pagada && (
                        <button type="button" onClick={() => handlePagar(f.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs">Pagar</button>
                      )}
                      <button type="button" onClick={() => handleEliminar(f.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
                {facturaExpandida === f.id && (
                  <tr key={f.id + '-det'}>
                    <td colSpan={6} className="px-6 py-3 bg-blue-50">
                      <p className="font-medium text-gray-700 mb-2">Detalle de factura #{f.id}</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 border-b">
                            <th className="text-left py-1">Descripcion</th>
                            <th className="text-left py-1">Cantidad</th>
                            <th className="text-left py-1">Precio unit.</th>
                            <th className="text-left py-1">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {f.detalles.map((d, i) => (
                            <tr key={i} className="border-b border-gray-200">
                              <td className="py-1">{d.descripcion}</td>
                              <td className="py-1">{d.cantidad}</td>
                              <td className="py-1">${d.precioUnitario.toFixed(2)}</td>
                              <td className="py-1">${d.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={3} className="py-2 font-bold text-right text-gray-700">Total:</td>
                            <td className="py-2 font-bold text-blue-700 text-sm">${f.total.toFixed(2)}</td>
                          </tr>
                        </tbody>
                          <tr><td colSpan={4} className="pt-3 pb-1"><div className="flex gap-2 mt-2"><input type="text" placeholder="Descripcion del cargo adicional" value={nuevoCargo.facturaId === f.id ? nuevoCargo.descripcion : ""} onChange={(e) => setNuevoCargo({ ...nuevoCargo, facturaId: f.id, descripcion: e.target.value })} className="flex-1 border rounded px-2 py-1 text-xs" /><input type="number" placeholder="Cant" value={nuevoCargo.facturaId === f.id ? nuevoCargo.cantidad : 1} onChange={(e) => setNuevoCargo({ ...nuevoCargo, facturaId: f.id, cantidad: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 text-xs" /><input type="number" placeholder="Precio" value={nuevoCargo.facturaId === f.id ? nuevoCargo.precioUnitario : 0} onChange={(e) => setNuevoCargo({ ...nuevoCargo, facturaId: f.id, precioUnitario: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-xs" /><button type="button" onClick={handleAgregarCargo} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">+ Agregar cargo</button></div></td></tr>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Facturacion;
