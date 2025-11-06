import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsAPI } from '../services/api';

function Comment({ comment, onDelete, onLikeUpdate }) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.userId;
  
  // Estado para likes
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este comentario?')) {
      onDelete(comment.id);
    }
  };

  const handleLike = async () => {
    if (isLoadingLike) return;

    // Actualización optimista
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLoadingLike(true);

    try {
      if (isLiked) {
        await commentsAPI.unlike(comment.id);
      } else {
        await commentsAPI.like(comment.id);
      }
      
      if (onLikeUpdate) {
        onLikeUpdate(comment.id, !isLiked);
      }
    } catch (error) {
      console.error('Error al dar/quitar like:', error);
      
      // Rollback
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      
      alert('Error al procesar el like');
    } finally {
      setIsLoadingLike(false);
    }
  };

  return (
    <div style={commentStyle}>
      <div style={commentHeaderStyle}>
        <div style={avatarSmallStyle}>
          {comment.user.name.charAt(0).toUpperCase()}
        </div>
        <div style={commentBodyStyle}>
          <div style={commentInfoStyle}>
            <strong style={authorNameStyle}>{comment.user.name}</strong>
            <span style={dateStyle}>{formatDate(comment.createdAt)}</span>
          </div>
          <p style={contentStyle}>{comment.content}</p>
          
          {/* Botón de like */}
          <div style={actionsStyle}>
            <button 
              onClick={handleLike}
              style={{
                ...likeButtonStyle,
                color: isLiked ? '#e0245e' : '#657786'
              }}
              disabled={isLoadingLike}
            >
              <span style={{ fontSize: '0.9rem' }}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              {likesCount > 0 && (
                <span style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}>
                  {likesCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {isAuthor && (
          <button onClick={handleDelete} style={deleteButtonStyle} title="Eliminar">
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

const commentStyle = {
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0'
};

const commentHeaderStyle = {
  display: 'flex',
  gap: '12px',
  position: 'relative'
};

const avatarSmallStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#1da1f2',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  flexShrink: 0
};

const commentBodyStyle = {
  flex: 1,
  minWidth: 0
};

const commentInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px'
};

const authorNameStyle = {
  fontSize: '0.875rem',
  color: '#14171a'
};

const dateStyle = {
  fontSize: '0.75rem',
  color: '#657786'
};

const contentStyle = {
  fontSize: '0.875rem',
  color: '#14171a',
  margin: '0 0 6px 0',
  lineHeight: '1.4',
  wordBreak: 'break-word'
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '4px'
};

const likeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
  fontSize: '0.75rem',
  fontWeight: '500'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1rem',
  cursor: 'pointer',
  opacity: 0.6,
  padding: '4px',
  transition: 'opacity 0.2s',
  position: 'absolute',
  right: 0,
  top: 0
};

export default Comment;