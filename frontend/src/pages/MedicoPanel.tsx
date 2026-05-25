import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Triaje {
  fecha: string;
  presionArterial: string | null;
  temperatura: number | null;
  peso: number | null;
  talla: number | null;
  frecuenciaCardiaca: number | null;
}

interface Receta {
  id: number;
  detalles: { medicamento: string; dosis: string; frecuencia: string; duracion: string }[];
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

interface Historia {
  paciente: Paciente;
  triajes: Triaje[];
  consultas: Consulta[];
}

interface ConsultaHoy {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  historia: {
    paciente: Paciente;
    triajes: Triaje[];
  };
}

interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
}

function MedicoPanel() {
  const [medico, setMedico] = useState<Medico | null>(null);
  const [consultas, setConsultas] = useState<ConsultaHoy[]>([]);
  const [consultaActiva, setConsultaActiva] = useState<ConsultaHoy | null>(null);
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [mostrarReceta, setMostrarReceta] = useState(false);
  const [detallesReceta, setDetallesReceta] = useState([{ medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);
  const [exito, setExito] = useState('');

  const cargarDatos = async () => {
    try {
      const { data } = await api.get('/medico-interfaz/pacientes-hoy');
      setMedico(data.medico);
      setConsultas(data.consultas);
    } catch {
      alert('No tienes un medico asociado a tu usuario');
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSeleccionarPaciente = async (consulta: ConsultaHoy) => {
    setConsultaActiva(consulta);
    setDiagnostico(consulta.diagnostico || '');
    setTratamiento(consulta.tratamiento || '');
    setMostrarReceta(false);
    try {
      const { data } = await api.get('/medico-interfaz/paciente/' + consulta.historia.paciente.id + '/historia');
      setHistoria(data);
    } catch {
      setHistoria(null);
    }
  };

  const handleGuardarConsulta = async () => {
    if (!consultaActiva) return;
    try {
      await api.put('/medico-interfaz/consulta/' + consultaActiva.id, { diagnostico, tratamiento });
      setExito('Consulta guardada correctamente');
      setTimeout(() => setExito(''), 3000);
      cargarDatos();
    } catch {
      alert('Error al guardar consulta');
    }
  };

  const handleGuardarReceta = async () => {
    if (!consultaActiva) return;
    try {
      await api.post('/medico-interfaz/consulta/' + consultaActiva.id + '/receta', { detalles: detallesReceta });
      setExito('Receta guardada correctamente');
      setMostrarReceta(false);
      setDetallesReceta([{ medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);
      setTimeout(() => setExito(''), 3000);
      handleSeleccionarPaciente(consultaActiva);
    } catch {
      alert('Error al guardar receta');
    }
  };

  const handleImprimir = (consulta: ConsultaHoy) => {
    const receta = historia?.consultas.find((c) => c.id === consulta.id)?.recetas[0];
    if (!receta) { alert('No hay receta para imprimir'); return; }
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    ventana.document.write(`
      <html><head><title>Receta Medica</title>
      <style>body{font-family:Arial;padding:40px;max-width:600px;margin:0 auto}
      h1{color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:10px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left}
      th{background:#f0f4ff}.footer{margin-top:60px;border-top:1px solid #ccc;padding-top:20px}
      </style></head><body>
      <h1>Clinica Nuevo Amanecer</h1>
      <h2>Receta Medica</h2>
      <p><strong>Paciente:</strong> ${consulta.historia.paciente.nombre} ${consulta.historia.paciente.apellido}</p>
      <p><strong>Cedula:</strong> ${consulta.historia.paciente.cedula}</p>
      <p><strong>Medico:</strong> Dr. ${medico?.nombre} ${medico?.apellido}</p>
      <p><strong>Especialidad:</strong> ${medico?.especialidad}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
      <table><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duracion</th></tr>
      ${receta.detalles.map((d) => `<tr><td>${d.medicamento}</td><td>${d.dosis}</td><td>${d.frecuencia}</td><td>${d.duracion}</td></tr>`).join('')}
      </table>
      <div class="footer"><p>_______________________</p><p>Firma del Medico</p></div>
      </body></html>
    `);
    ventana.document.close();
    ventana.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-bold">Clinica Nuevo Amanecer</h1>
          {medico && <p className="text-xs text-blue-200">Dr. {medico.nombre} {medico.apellido} — {medico.especialidad}</p>}
        </div>
        <button type="button" onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="text-xs bg-blue-600 px-3 py-1 rounded-lg">Cerrar sesion</button>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
        {exito && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{exito}</div>}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-gray-700 mb-3">Pacientes de hoy ({consultas.length})</h3>
            {consultas.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay pacientes para hoy</p>
            ) : consultas.map((c, i) => (
              <div key={c.id} onClick={() => handleSeleccionarPaciente(c)} className={`p-3 rounded-lg cursor-pointer mb-2 border-2 ${consultaActiva?.id === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div>
                    <p className="font-medium text-sm">{c.historia.paciente.nombre} {c.historia.paciente.apellido}</p>
                    <p className="text-xs text-gray-400">{c.motivo}</p>
                    {c.diagnostico && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Atendido</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-2">
            {consultaActiva ? (
              <div>
                <div className="bg-white rounded-xl shadow p-4 mb-4">
                  <h3 className="font-bold text-gray-700 mb-2">{consultaActiva.historia.paciente.nombre} {consultaActiva.historia.paciente.apellido}</h3>
                  <p className="text-sm text-gray-500 mb-3">Cedula: {consultaActiva.historia.paciente.cedula} | Motivo: {consultaActiva.motivo}</p>
                  {consultaActiva.historia.triajes.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 grid grid-cols-4 gap-2 text-xs">
                      <div><p className="text-gray-500">Presion</p><p className="font-bold">{consultaActiva.historia.triajes[0].presionArterial || '-'}</p></div>
                      <div><p className="text-gray-500">Temp</p><p className="font-bold">{consultaActiva.historia.triajes[0].temperatura || '-'} C</p></div>
                      <div><p className="text-gray-500">Peso</p><p className="font-bold">{consultaActiva.historia.triajes[0].peso || '-'} kg</p></div>
                      <div><p className="text-gray-500">Talla</p><p className="font-bold">{consultaActiva.historia.triajes[0].talla || '-'} cm</p></div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Diagnostico</label>
                    <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Ingresa el diagnostico..." />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tratamiento</label>
                    <textarea value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Ingresa el tratamiento..." />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleGuardarConsulta} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar consulta</button>
                    <button type="button" onClick={() => setMostrarReceta(!mostrarReceta)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Receta</button>
                    <button type="button" onClick={() => handleImprimir(consultaActiva)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Imprimir receta</button>
                  </div>
                </div>
                {mostrarReceta && (
                  <div className="bg-white rounded-xl shadow p-4 mb-4">
                    <h4 className="font-bold text-gray-700 mb-3">Nueva receta</h4>
                    {detallesReceta.map((d, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                        <input type="text" placeholder="Medicamento" value={d.medicamento} onChange={(e) => { const n = [...detallesReceta]; n[i] = { ...n[i], medicamento: e.target.value }; setDetallesReceta(n); }} className="border rounded px-2 py-1 text-sm" />
                        <input type="text" placeholder="Dosis" value={d.dosis} onChange={(e) => { const n = [...detallesReceta]; n[i] = { ...n[i], dosis: e.target.value }; setDetallesReceta(n); }} className="border rounded px-2 py-1 text-sm" />
                        <input type="text" placeholder="Frecuencia" value={d.frecuencia} onChange={(e) => { const n = [...detallesReceta]; n[i] = { ...n[i], frecuencia: e.target.value }; setDetallesReceta(n); }} className="border rounded px-2 py-1 text-sm" />
                        <input type="text" placeholder="Duracion" value={d.duracion} onChange={(e) => { const n = [...detallesReceta]; n[i] = { ...n[i], duracion: e.target.value }; setDetallesReceta(n); }} className="border rounded px-2 py-1 text-sm" />
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setDetallesReceta([...detallesReceta, { medicamento: '', dosis: '', frecuencia: '', duracion: '' }])} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">+ Medicamento</button>
                      <button type="button" onClick={handleGuardarReceta} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Guardar receta</button>
                    </div>
                  </div>
                )}
                {historia && historia.consultas.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-4">
                    <h4 className="font-bold text-gray-700 mb-3">Historial de consultas</h4>
                    {historia.consultas.map((c) => (
                      <div key={c.id} className="border-b py-3">
                        <p className="text-sm font-medium">{c.motivo}</p>
                        <p className="text-xs text-gray-400">{new Date(c.fecha).toLocaleDateString()} — Dr. {c.medico.nombre} {c.medico.apellido}</p>
                        {c.diagnostico && <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Dx:</span> {c.diagnostico}</p>}
                        {c.tratamiento && <p className="text-xs text-gray-600"><span className="font-medium">Tx:</span> {c.tratamiento}</p>}
                        {c.recetas.length > 0 && (
                          <div className="mt-1 bg-green-50 rounded p-2">
                            {c.recetas[0].detalles.map((d, i) => (
                              <p key={i} className="text-xs text-green-700">{d.medicamento} — {d.dosis} — {d.frecuencia}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center text-gray-400">
                Selecciona un paciente para comenzar la consulta
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicoPanel;