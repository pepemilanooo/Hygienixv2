import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    ragioneSociale: '',
    tipo: 'AZIENDA',
    piva: '',
    codiceFiscale: '',
    email: '',
    telefono: '',
    telefonoSecondario: '',
    indirizzoLegale: '',
    citta: '',
    cap: '',
    provincia: '',
    referente: '',
    telefonoReferente: '',
    emailReferente: '',
    note: '',
    attivo: true
  });

  useEffect(() => {
    if (isEdit) fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/clients/${id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      navigate('/clients');
    } catch (err) {
      alert('Errore: ' + err.response?.data?.error);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Modifica' : 'Nuovo'} Cliente</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ragione Sociale *</label>
            <input
              name="ragioneSociale"
              value={formData.ragioneSociale}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="AZIENDA">Azienda</option>
              <option value="PRIVATO">Privato</option>
              <option value="CONDOMINIO">Condominio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Partita IVA</label>
            <input name="piva" value={formData.piva} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Codice Fiscale</label>
            <input name="codiceFiscale" value={formData.codiceFiscale} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefono</label>
            <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Indirizzo</label>
            <input name="indirizzoLegale" value={formData.indirizzoLegale} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Città</label>
            <input name="citta" value={formData.citta} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CAP</label>
            <input name="cap" value={formData.cap} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Provincia</label>
            <input name="provincia" value={formData.provincia} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referente</label>
            <input name="referente" value={formData.referente} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tel. Referente</label>
            <input name="telefonoReferente" value={formData.telefonoReferente} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea name="note" value={formData.note} onChange={handleChange} className="w-full px-3 py-2 border rounded" rows={3} />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Salva
          </button>
          <button type="button" onClick={() => navigate('/clients')} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
