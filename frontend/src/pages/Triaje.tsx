import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  createdAt: string;
}

interface Triaje {
  id: number;
  fecha: string;
  presionArterial: string | null;
  temperatura: number | null;
  peso: number | null;
  talla: number | null;
  frecuenciaCardiaca: number | null;
}

function Triaje() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [sinTriaje, setSinTriaje] = useState<Paciente[]>([]);
  const [form, setForm] = useState({
    pacienteId: '',
    presionArterial: '',
    temperatura: '',
    peso: '',
    talla: '',
    frecuenciaCardiaca: '',
    talla: '150',
  });
  const [imc, setImc] = useState<number | null>(null);
  const [clasificacion, setClasificacion] = useState('');
  const [exito, setExito] = useState(false);
const cargarPacientes = async () => {
    const { data } = await api.get('/pacientes');
    setPacientes(data);
    const sinT: Paciente[] = [];
    for (const p of data) {
      try {
        const res = await api.get('/triaje/' + p.id);
        if (res.data.length === 0) sinT.push(p);
      } catch {
        sinT.push(p);
      }
    }
    setSinTriaje(sinT);
  };

  useEffect(() => {
    cargarPacientes();
    const intervalo = setInterval(cargarPacientes, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const calcularImc = (peso: string, talla: string) => {
    if (peso && talla) {
      const p = Number(peso);
      const tallaNum = Number(talla);
      const t = tallaNum > 3 ? tallaNum / 100 : tallaNum;
      const valor = Math.round((p / (t * t)) * 10) / 10;
      setImc(valor);
      if (valor < 18.5) setClasificacion('Bajo peso');
      else if (valor < 25) setClasificacion('Normal');
      else if (valor < 30) setClasificacion('Sobrepeso');
      else setClasificacion('Obesidad');
    } else {
      setImc(null);
      setClasificacion('');
    }
  };

  const handleChange = (key: string, value: string) => {
    const nuevo = { ...form, [key]: value };
    setForm(nuevo);
    if (key === 'peso' || key === 'talla') {
      calcularImc(key === 'peso' ? value : form.peso, key === 'talla' ? value : form.talla);
    }
  };

  const handleSeleccionarPaciente = (p: Paciente) => {
    setPacienteSeleccionado(p);
    setForm({ ...form, pacienteId: String(p.id) });
  };

  const handleGuardar = async () => {
    try {
      await api.post('/triaje', form);
      setExito(true);
      setPacienteSeleccionado(null);
      setForm({ pacienteId: '', presionArterial: '', temperatura: '', peso: '', talla: '', frecuenciaCardiaca: '' });
      setImc(null);
      setClasificacion('');
      setTimeout(() => setExito(false), 3000);
      cargarPacientes();
    } catch {
      alert('Error al guardar triaje');
    }
  };
return (
    <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Triaje y Signos Vitales</h2>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-lg">
          {sinTriaje.length} pacientes requieren triaje
        </div>
      </div>
      {exito && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
          Triaje guardado correctamente
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-700 mb-3">Cola de pacientes</h3>
          {sinTriaje.length === 0 ? (
            <p className="text-gray-400 text-sm">Todos los pacientes han sido atendidos</p>
          ) : (
            <div className="space-y-2">
              {sinTriaje.map((p, index) => (
                <div key={p.id} onClick={() => handleSeleccionarPaciente(p)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 ${pacienteSeleccionado?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}>
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{p.nombre} {p.apellido}</p>
                    <p className="text-xs text-gray-400">{p.cedula}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          {pacienteSeleccionado ? (
            <>
              <h3 className="font-bold text-gray-700 mb-3">Registrar triaje: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Presion Arterial (mmHg)', key: 'presionArterial', type: 'text', placeholder: '120/80' },
                  { label: 'Temperatura (C)', key: 'temperatura', type: 'number', placeholder: '36.5' },
                  { label: 'Peso (kg)', key: 'peso', type: 'number', placeholder: '70' },
                  { label: 'Talla (cm)', key: 'talla', type: 'number', placeholder: '170' },
                  { label: 'Frecuencia Cardiaca (lpm)', key: 'frecuenciaCardiaca', type: 'number', placeholder: '80' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              {imc && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600">IMC:</p>
                  <p className="text-xl font-bold text-green-600">{imc} — {clasificacion}</p>
                </div>
              )}
              <button type="button" onClick={handleGuardar} className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium">
                Guardar triaje
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Selecciona un paciente de la cola
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default Triaje;
