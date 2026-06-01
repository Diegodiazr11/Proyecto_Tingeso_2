import keycloak from '../service/keyclaok';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ authenticated, requiredRole, keycloak, children }) {
  if (!authenticated) {
    return <Navigate to="/" />;
  }

  if (requiredRole) {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (!roles.includes(requiredRole)) {
      if (roles.includes('admin')) {
        return <Navigate to="/admin/dashboard" />;
      } else {
        return <Navigate to="/client/dashboard" />;
      }
    }
  }

  return children;
}

export default ProtectedRoute;