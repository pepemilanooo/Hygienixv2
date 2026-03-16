import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients', { params: { search } });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clienti</h1>
        <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nuovo Cliente
        </Link>
      </div>

      <input
        type="text"
        placeholder="Cerca cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2 border rounded mb-6"
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Ragione Sociale</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Città</th>
              <th className="px-4 py-3 text-left">Telefono</th>
              <th className="px-4 py-3 text-left">Interventi</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{client.ragioneSociale}</td>
                <td className="px-4 py-3">{client.tipo}</td>
                <td className="px-4 py-3">{client.citta}</td>
                <td className="px-4 py-3">{client.telefono}</td>
                <td className="px-4 py-3">{client._count?.interventions || 0}</td>
                <td className="px-4 py-3">
                  <Link to={`/clients/${client.id}`} className="text-blue-600 hover:underline">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
