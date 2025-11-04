import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

function UserProfile() {
  const { userId } = useParams();  // ← Extrae el parámetro de la URL
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener información del usuario
        const userResponse = await usersAPI.getById(userId);
        setUser(userResponse.data.user);
        
        // Obtener posts del usuario
        const postsResponse = await postsAPI.getByUser(userId);
        setPosts(postsResponse.data.posts);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.error || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // ← Se ejecuta cada vez que cambia el userId en la URL

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return <div style={loadingStyle}>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div style={errorContainerStyle}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={buttonStyle}>
          ← Volver al Feed
        </button>
      </div>
    );
  }

  if (!user) {
    return <div style={errorContainerStyle}>Usuario no encontrado</div>;
  }

  return (
    <div style={containerStyle}>
      {/* Header del perfil */}
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Volver
        </button>
      </div>

      {/* Información del usuario */}
      <div style={profileCardStyle}>
        <img 
          src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`}
          alt={user.name}
          style={avatarStyle}
        />
        <div style={infoStyle}>
          <h1 style={nameStyle}>{user.name}</h1>
          <p style={emailStyle}>{user.email}</p>
          <p style={statsStyle}>
            📝 {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'}
          </p>
          <p style={dateStyle}>
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>

      {/* Posts del usuario */}
      <div style={postsContainerStyle}>
        <h2 style={postsTitleStyle}>Publicaciones</h2>
        {posts.length === 0 ? (
          <div style={noPostsStyle}>
            <p>Este usuario aún no ha publicado nada.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              onDelete={handlePostDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Estilos
const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px'
};

const headerStyle = {
  marginBottom: '20px'
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#1da1f2',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '8px 12px',
  fontWeight: 'bold'
};

const profileCardStyle = {
  backgroundColor: 'white',
  border: '1px solid #e1e8ed',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  display: 'flex',
  gap: '20px',
  alignItems: 'center'
};

const avatarStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '4px solid #f5f8fa'
};

const infoStyle = {
  flex: 1
};

const nameStyle = {
  margin: '0 0 8px 0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#14171a'
};

const emailStyle = {
  color: '#657786',
  margin: '0 0 12px 0'
};

const statsStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#14171a',
  margin: '8px 0'
};

const dateStyle = {
  color: '#657786',
  fontSize: '14px',
  margin: '4px 0'
};

const postsContainerStyle = {
  marginTop: '24px'
};

const postsTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#14171a'
};

const noPostsStyle = {
  backgroundColor: '#f7f9fa',
  padding: '40px',
  textAlign: 'center',
  borderRadius: '12px',
  color: '#657786'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  fontSize: '18px',
  color: '#657786'
};

const errorContainerStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e0245e'
};

const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: '#1da1f2',
  color: 'white',
  border: 'none',
  borderRadius: '9999px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '16px'
};

export default UserProfile;