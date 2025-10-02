import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div>
      <nav style={navStyle}>
        <h2>Twitter Clone</h2>
        <div style={linksStyle}>
          <Link to="/" style={linkStyle}>Feed</Link>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/register" style={linkStyle}>Register</Link>
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
  gap: '1rem'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px'
};

const mainStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

export default Layout;