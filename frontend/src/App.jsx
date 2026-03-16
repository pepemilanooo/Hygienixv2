import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import Interventions from './pages/Interventions';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Caricamento...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
        <Route path="/interventions" element={<ProtectedRoute><Interventions /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
