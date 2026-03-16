import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Interventions() {
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      const res = await api.get('/interventions');
      setInterventions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interventi</h1>
        <Link to="/interventions/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nuovo Intervento
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Sede</th>
              <th className="px-4 py-3 text-left">Tecnico</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((int) => (
              <tr key={int.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(int.dataProgrammata).toLocaleDateString('it-IT')}</td>
                <td className="px-4 py-3">{int.client?.ragioneSociale}</td>
                <td className="px-4 py-3">{int.location?.nomeSede}</td>
                <td className="px-4 py-3">{int.tecnico?.nome} {int.tecnico?.cognome}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    int.stato === 'PIANIFICATO' ? 'bg-yellow-100 text-yellow-800' :
                    int.stato === 'IN_CORSO' ? 'bg-blue-100 text-blue-800' :
                    int.stato === 'COMPLETATO' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {int.stato}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/interventions/${int.id}`} className="text-blue-600 hover:underline">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
