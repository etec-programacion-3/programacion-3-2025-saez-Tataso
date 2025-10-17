import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav style={navStyle}>
        <h2>Twitetec</h2>
        <div style={linksStyle}>
          <Link to="/" style={linkStyle}>Feed</Link>
          
          {isAuthenticated() ? (
            <>
              <span style={userStyle}>Hola, {user?.name}</span>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          )}
        </div>
      </nav>
      
      <main style={mainStyle}>
        {children}
      </main>
    </div>
  );
}

const navStyle = {
  backgroundColor: '#1da1f2',
  color: 'white',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const linksStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px'
};

const userStyle = {
  color: 'white',
  fontWeight: 'bold'
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const mainStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

export default Layout;