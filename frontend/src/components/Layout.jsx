import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Hygienix v2</Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className={`hover:text-blue-200 ${isActive('/') ? 'font-semibold' : ''}`}>Dashboard</Link>
            <Link to="/clients" className={`hover:text-blue-200 ${isActive('/clients') ? 'font-semibold' : ''}`}>Clienti</Link>
            <Link to="/interventions" className={`hover:text-blue-200 ${isActive('/interventions') ? 'font-semibold' : ''}`}>Interventi</Link>
            
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm">{user?.nome} {user?.cognome}</span>
              <button onClick={handleLogout} className="bg-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-800">
                Esci
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  );
}
