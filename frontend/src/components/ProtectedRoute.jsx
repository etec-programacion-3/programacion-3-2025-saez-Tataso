import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated()) {
    // Si llegó aquí con token expirado, hacer logout
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;