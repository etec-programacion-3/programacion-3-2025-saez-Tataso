import { useState } from 'react';
import { postsAPI } from '../services/api';

function CreatePost({ onPostCreated }) {
  const [formData, setFormData] = useState({
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await postsAPI.create(formData);
      setFormData({ content: '' });
      onPostCreated(response.data.post);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear publicación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Crear Publicación</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={formStyle}>
        
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="¿Qué estás pensando?"
          required
          rows="4"
          style={textareaStyle}
        />
        
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  padding: '1.5rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  marginBottom: '2rem'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const textareaStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  resize: 'vertical'
};

const buttonStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  backgroundColor: '#1da1f2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const errorStyle = {
  padding: '0.75rem',
  backgroundColor: '#fee',
  color: '#c00',
  borderRadius: '4px',
  marginBottom: '1rem'
};

export default CreatePost;