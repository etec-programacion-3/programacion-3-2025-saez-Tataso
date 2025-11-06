import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

function Post({ post, onDelete, onLikeUpdate }) {
  const { user } = useAuth();
  const isAuthor = user?.id === post.authorId;
  
  // Estado local para actualización optimista
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      onDelete(post.id);
    }
  };

  const handleLike = async () => {
    if (isLoadingLike) return; // Prevenir clicks múltiples

    // ACTUALIZACIÓN OPTIMISTA: Cambiar UI inmediatamente
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLoadingLike(true);

    try {
      if (isLiked) {
        // Quitar like
        await postsAPI.unlike(post.id);
      } else {
        // Dar like
        await postsAPI.like(post.id);
      }
      
      // Notificar al componente padre si existe
      if (onLikeUpdate) {
        onLikeUpdate(post.id, !isLiked);
      }
    } catch (error) {
      console.error('Error al dar/quitar like:', error);
      
      // ROLLBACK: Revertir cambios si falla
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      
      alert('Error al procesar el like. Intenta de nuevo.');
    } finally {
      setIsLoadingLike(false);
    }
  };

  return (
    <article style={postCardStyle}>
      <div style={postHeaderStyle}>
        <div style={authorInfoStyle}>
          <div style={avatarStyle}>
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link 
              to={`/perfil/${post.authorId}`} 
              style={authorNameLinkStyle}
            >
              <strong style={authorNameStyle}>{post.author.name}</strong>
            </Link>
            <div style={dateStyle}>{formatDate(post.createdAt)}</div>
          </div>
        </div>
        
        {isAuthor && (
          <button onClick={handleDelete} style={deleteButtonStyle}>
            🗑️
          </button>
        )}
      </div>
      
      <div style={contentStyle}>
        <p>{post.content}</p>
      </div>
      
      <div style={footerStyle}>
        <button 
          onClick={handleLike}
          style={{
            ...likeButtonStyle,
            color: isLiked ? '#e0245e' : '#657786',
            cursor: isLoadingLike ? 'wait' : 'pointer'
          }}
          disabled={isLoadingLike}
        >
          <span style={{ fontSize: '1.2rem' }}>
            {isLiked ? '❤️' : '🤍'}
          </span>
          <span style={{ marginLeft: '0.5rem' }}>
            {likesCount} {likesCount === 1 ? 'me gusta' : 'me gusta'}
          </span>
        </button>
        
        <span style={statStyle}>💬 0 comentarios</span>
      </div>
    </article>
  );
}

const postCardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e1e8ed',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1rem',
  transition: 'box-shadow 0.2s'
};

const postHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
};

const authorInfoStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center'
};

const avatarStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: '#1da1f2',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  fontWeight: 'bold'
};

const authorNameLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  transition: 'color 0.2s'
};

const authorNameStyle = {
  fontSize: '1rem',
  color: '#14171a'
};

const dateStyle = {
  fontSize: '0.875rem',
  color: '#657786',
  marginTop: '0.25rem'
};

const contentStyle = {
  fontSize: '1rem',
  lineHeight: '1.5',
  color: '#14171a',
  marginBottom: '1rem'
};

const footerStyle = {
  display: 'flex',
  gap: '2rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e1e8ed',
  alignItems: 'center'
};

const likeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '0.875rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
  fontWeight: '500'
};

const statStyle = {
  fontSize: '0.875rem',
  color: '#657786'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  opacity: 0.7,
  transition: 'opacity 0.2s'
};

export default Post;