import { useState, useEffect } from 'react';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { commentsAPI } from '../services/api';

function CommentList({ postId, initialCount, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsAPI.getByPost(postId);
      setComments(response.data.comments);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (content) => {
    try {
      setIsSubmitting(true);
      const response = await commentsAPI.create(postId, { content });
      
      // Agregar comentario al inicio de la lista
      setComments([response.data.comment, ...comments]);
      
      // Actualizar contador en el post
      if (onCountChange) {
        onCountChange(response.data.commentsCount);
      }
    } catch (err) {
      console.error('Error al crear comentario:', err);
      alert('Error al publicar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await commentsAPI.delete(commentId);
      
      // Eliminar comentario de la lista
      setComments(comments.filter(c => c.id !== commentId));
      
      // Actualizar contador
      if (onCountChange) {
        onCountChange(response.data.commentsCount);
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      alert('Error al eliminar el comentario');
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Cargando comentarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <CommentForm onSubmit={handleCreateComment} isLoading={isSubmitting} />
      
      {comments.length === 0 ? (
        <div style={emptyStyle}>
          No hay comentarios aún. ¡Sé el primero en comentar!
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid #e1e8ed'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#657786',
  fontSize: '0.875rem'
};

const errorStyle = {
  padding: '12px',
  backgroundColor: '#fee',
  color: '#c00',
  borderRadius: '6px',
  fontSize: '0.875rem'
};

const emptyStyle = {
  textAlign: 'center',
  padding: '24px',
  color: '#657786',
  fontSize: '0.875rem'
};

export default CommentList;