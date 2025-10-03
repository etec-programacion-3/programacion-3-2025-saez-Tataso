import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data.posts);
    } catch (err) {
      setError('Error al cargar publicaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      return;
    }

    try {
      await postsAPI.delete(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      alert('Error al eliminar publicación');
      console.error(err);
    }
  };

  if (loading) return <div>Cargando publicaciones...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div>
      <h1>Feed de Publicaciones</h1>
      
      <CreatePost onPostCreated={handlePostCreated} />
      
      {posts.length === 0 ? (
        <p>No hay publicaciones aún. ¡Sé el primero en publicar!</p>
      ) : (
        <div style={postsContainerStyle}>
          {posts.map(post => (
            <div key={post.id} style={postCardStyle}>
              <div style={postHeaderStyle}>
                <strong>{post.author.name}</strong>
                <span style={dateStyle}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              
              {user.id === post.authorId && (
                <button 
                  onClick={() => handleDelete(post.id)}
                  style={deleteButtonStyle}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Estilos
const errorStyle = {
  padding: '1rem',
  backgroundColor: '#fee',
  color: '#c00',
  borderRadius: '4px'
};

const postsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem'
};

const postCardStyle = {
  padding: '1.5rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff'
};

const postHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #eee'
};

const dateStyle = {
  color: '#999',
  fontSize: '0.9rem'
};

const deleteButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 1rem',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default Feed;