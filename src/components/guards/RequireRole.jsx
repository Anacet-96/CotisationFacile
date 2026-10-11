import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HOME_BY_ROLE = {
  client: '/client',
  collecteur: '/collecteur',
  secretaire: '/secretaire',
  admin: '/admin',
};

export default function RequireRole({ role, children }) {
  const { user, role: currentRole, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-muted">Chargement…</div>;

  if (!user) return <Navigate to="/connexion" replace />;

  if (Array.isArray(role)) {
    if (!role.includes(currentRole)) {
      return <Navigate to={HOME_BY_ROLE[currentRole] || '/'} replace />;
    }
  } else if (currentRole !== role) {
    return <Navigate to={HOME_BY_ROLE[currentRole] || '/'} replace />;
  }

  return children;
}