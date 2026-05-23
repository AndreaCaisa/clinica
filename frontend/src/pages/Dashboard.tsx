import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api from '../api/axios';

interface DashboardData {
  totalPacientes: number;
  totalMedicos: number;
  citasHoy: number;
  habitacionesDisponibles: number;
  habitacionesOcupadas: number;
  facturasPendientes: number;
  ingresosMes: number;
  insumosStockBajo: number;
}

function Dashboard() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setDatos(res.data);
      setCargando(false);
    });
  }, []);

  if (cargando) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="text-center py-20 text-gray-500">Cargando dashboard...</div>
    </div>
  );

  if (!datos) return null;

  const tarjetas = [
    { titulo: 'Total Pacientes', valor: datos.totalPacientes, color: 'bg-blue-50 text-blue-700', icono: '👥' },
    { titulo: 'Total Medicos', valor: datos.totalMedicos, color: 'bg-purple-50 text-purple-700', icono: '👨‍⚕️' },
    { titulo: 'Citas Hoy', valor: datos.citasHoy, color: 'bg-green-50 text-green-700', icono: '📅' },
    { titulo: 'Camas Disponibles', valor: datos.habitacionesDisponibles, color: 'bg-teal-50 text-teal-700', icono: '🛏️' },
    { titulo: 'Camas Ocupadas', valor: datos.habitacionesOcupadas, color: 'bg-red-50 text-red-700', icono: '🏥' },
    { titulo: 'Facturas Pendientes', valor: datos.facturasPendientes, color: 'bg-yellow-50 text-yellow-700', icono: '📄' },
    { titulo: 'Ingresos del Mes', valor: '$' + datos.ingresosMes.toFixed(2), color: 'bg-emerald-50 text-emerald-700', icono: '💰' },
    { titulo: 'Stock Bajo', valor: datos.insumosStockBajo, color: 'bg-orange-50 text-orange-700', icono: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">Resumen general del sistema</p>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {tarjetas.map((t) => (
            <div key={t.titulo} className={"rounded-xl p-4 " + t.color}>
              <div className="text-2xl mb-1">{t.icono}</div>
              <p className="text-2xl font-bold">{t.valor}</p>
              <p className="text-xs font-medium mt-1">{t.titulo}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-gray-700 mb-3">Estado de camas</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full"
                  style={{ width: datos.habitacionesOcupadas + datos.habitacionesDisponibles > 0 ? (datos.habitacionesOcupadas / (datos.habitacionesOcupadas + datos.habitacionesDisponibles) * 100) + '%' : '0%' }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {datos.habitacionesOcupadas}/{datos.habitacionesOcupadas + datos.habitacionesDisponibles}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Ocupadas: {datos.habitacionesOcupadas}</span>
              <span>Disponibles: {datos.habitacionesDisponibles}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-gray-700 mb-3">Alertas del sistema</h3>
            {datos.insumosStockBajo > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3 mb-2">
                <span className="text-orange-500">⚠️</span>
                <p className="text-sm text-orange-700">{datos.insumosStockBajo} medicamento(s) con stock bajo</p>
              </div>
            )}
            {datos.facturasPendientes > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-3 mb-2">
                <span className="text-yellow-500">📄</span>
                <p className="text-sm text-yellow-700">{datos.facturasPendientes} factura(s) pendiente(s) de pago</p>
              </div>
            )}
            {datos.insumosStockBajo === 0 && datos.facturasPendientes === 0 && (
              <p className="text-sm text-green-600">Sin alertas activas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
