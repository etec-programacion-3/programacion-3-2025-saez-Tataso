import { useAuth } from '../context/AuthContext';

function Post({ post, onDelete }) {
  const { user } = useAuth();
  const isAuthor = user?.id === post.authorId;

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

  return (
    <article style={postCardStyle}>
      <div style={postHeaderStyle}>
        <div style={authorInfoStyle}>
          <div style={avatarStyle}>
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={authorNameStyle}>{post.author.name}</strong>
            <div style={dateStyle}>{formatDate(post.createdAt)}</div>
          </div>
        </div>
        
        {isAuthor && (
          <button onClick={handleDelete} style={deleteButtonStyle}>
            <span style = {statStyle}>Eliminar</span>
          </button>
        )}
      </div>
      
      <div style={contentStyle}>
        <p>{post.content}</p>
      </div>
      
      <div style={footerStyle}>
        <span style={statStyle}>💬 0 comentarios</span>
        <span style={statStyle}>❤️ 0 me gusta</span>
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
  transition: 'box-shadow 0.2s',
  cursor: 'pointer'
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
  borderTop: '1px solid #e1e8ed'
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