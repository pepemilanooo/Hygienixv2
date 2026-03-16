import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');

  useEffect(() => {
    loadClients();
  }, [search, tipo]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (tipo) params.tipo = tipo;
      const res = await api.get('/clients', { params });
      setClients(res.data);
    } catch (error) {
      console.error('Errore caricamento clienti:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (error) {
      alert('Errore eliminazione cliente');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Clienti</h1>
        <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuovo Cliente
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cerca cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Tutti i tipi</option>
          <option value="AZIENDA">Azienda</option>
          <option value="PRIVATO">Privato</option>
          <option value="CONDOMINIO">Condominio</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">Caricamento...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Ragione Sociale</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Contatto</th>
                <th className="px-4 py-3 text-center">Sedi</th>
                <th className="px-4 py-3 text-center">Interventi</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{client.ragioneSociale}</div>
                    <div className="text-sm text-gray-500">{client.piva || client.codiceFiscale}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${client.tipo === 'AZIENDA' ? 'bg-blue-100 text-blue-800' : client.tipo === 'PRIVATO' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      {client.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.telefono}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/clients/${client.id}/locations`} className="text-blue-600 hover:underline">
                      {client.locations?.length || 0} sedi
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {client._count?.interventions || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-800 mr-3">Modifica</Link>
                    <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-800">Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="text-center py-10 text-gray-500">Nessun cliente trovato</div>
          )}
        </div>
      )}
    </div>
  );
}
