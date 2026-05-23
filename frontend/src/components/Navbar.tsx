import { useNavigate } from 'react-router-dom';

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

function Navbar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const rol = usuario.rol || '';
  const linksVisibles = NAV_LINKS.filter((l) => l.roles.includes(rol));

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
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
  );
}

export default Navbar;

