import { useAuth } from '../context/AuthContext';

function Comment({ comment, onDelete }) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.userId;

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
  margin: 0,
  lineHeight: '1.4',
  wordBreak: 'break-word'
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