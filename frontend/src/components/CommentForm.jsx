import { useState } from 'react';

function CommentForm({ onSubmit, isLoading }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      await onSubmit(content);
      setContent(''); // Limpiar después de enviar
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        rows="2"
        style={textareaStyle}
        disabled={isLoading}
      />
      <button 
        type="submit" 
        style={buttonStyle}
        disabled={isLoading || !content.trim()}
      >
        {isLoading ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  );
}

const formStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  padding: '12px',
  backgroundColor: '#f7f9fa',
  borderRadius: '8px'
};

const textareaStyle = {
  flex: 1,
  padding: '8px 12px',
  fontSize: '0.875rem',
  border: '1px solid #e1e8ed',
  borderRadius: '6px',
  resize: 'vertical',
  fontFamily: 'inherit',
  minHeight: '40px'
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#1da1f2',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  alignSelf: 'flex-end',
  transition: 'background-color 0.2s'
};

export default CommentForm;