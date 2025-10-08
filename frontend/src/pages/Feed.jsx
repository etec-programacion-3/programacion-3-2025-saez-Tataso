import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll();
      setPosts(response.data.posts);
      setError('');
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
    try {
      await postsAPI.delete(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      alert('Error al eliminar publicación');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={spinnerStyle}>⏳</div>
        <p>Cargando publicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorContainerStyle}>
        <p>{error}</p>
        <button onClick={loadPosts} style={retryButtonStyle}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Feed de Publicaciones</h1>
      
      <CreatePost onPostCreated={handlePostCreated} />
      
      {posts.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>📭 No hay publicaciones aún</p>
          <p style={emptySubtextStyle}>¡Sé el primero en publicar algo!</p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto'
};

const titleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1.5rem',
  color: '#14171a'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  color: '#657786'
};

const spinnerStyle = {
  fontSize: '3rem',
  animation: 'spin 1s linear infinite'
};

const errorContainerStyle = {
  padding: '2rem',
  textAlign: 'center',
  backgroundColor: '#fee',
  color: '#c00',
  borderRadius: '8px'
};

const retryButtonStyle = {
  marginTop: '1rem',
  padding: '0.5rem 1rem',
  backgroundColor: '#1da1f2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '3rem',
  color: '#657786'
};

const emptySubtextStyle = {
  fontSize: '0.875rem',
  marginTop: '0.5rem'
};

export default Feed;