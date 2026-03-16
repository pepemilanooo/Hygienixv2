import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchUpcoming();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await api.get('/dashboard/upcoming');
      setUpcoming(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-600 text-sm">Interventi Oggi</p>
          <p className="text-3xl font-bold text-blue-800">{stats.today || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-600 text-sm">Questa Settimana</p>
          <p className="text-3xl font-bold text-green-800">{stats.week || 0}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-purple-600 text-sm">Questo Mese</p>
          <p className="text-3xl font-bold text-purple-800">{stats.month || 0}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <p className="text-orange-600 text-sm">Clienti Attivi</p>
          <p className="text-3xl font-bold text-orange-800">{stats.clients || 0}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Prossimi Interventi</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Sede</th>
              <th className="px-4 py-2 text-left">Stato</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((int) => (
              <tr key={int.id} className="border-t">
                <td className="px-4 py-2">{new Date(int.dataProgrammata).toLocaleDateString('it-IT')}</td>
                <td className="px-4 py-2">{int.client?.ragioneSociale}</td>
                <td className="px-4 py-2">{int.location?.nomeSede}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    int.stato === 'PIANIFICATO' ? 'bg-yellow-100 text-yellow-800' :
                    int.stato === 'IN_CORSO' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {int.stato}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
