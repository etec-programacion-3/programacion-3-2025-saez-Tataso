import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const isAuthor = user?.id === post.author.id;

  const handleDelete = async () => {
    if (window.confirm('¿Seguro que quieres eliminar este post?')) {
      try {
        await postsAPI.delete(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el post');
      }
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={authorInfoStyle}>
          <img 
            src={`https://ui-avatars.com/api/?name=${post.author.name}&background=random`}
            alt={post.author.name}
            style={avatarStyle}
          />
          <div>
            <Link 
              to={`/perfil/${post.author.id}`} 
              style={authorLinkStyle}
            >
              {post.author.name}
            </Link>
            <div style={emailStyle}>{post.author.email}</div>
          </div>
        </div>
        {isAuthor && (
          <button onClick={handleDelete} style={deleteButtonStyle}>
            🗑️
          </button>
        )}
      </div>
      <p style={contentStyle}>{post.content}</p>
      <div style={dateStyle}>
        {new Date(post.createdAt).toLocaleString('es-AR')}
      </div>
    </div>
  );
}

// Estilos
const cardStyle = {
  backgroundColor: 'white',
  border: '1px solid #e1e8ed',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px'
};

const authorInfoStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const avatarStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%'
};

const authorLinkStyle = {
  color: '#1da1f2',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontSize: '15px'
};

const emailStyle = {
  color: '#657786',
  fontSize: '13px'
};

const contentStyle = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#14171a',
  margin: '12px 0'
};

const dateStyle = {
  color: '#657786',
  fontSize: '13px'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '4px 8px'
};

export default PostCard;