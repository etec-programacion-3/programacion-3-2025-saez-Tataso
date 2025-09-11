const express = require('express');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: '¡API funcionando!' });
});

// Rutas de usuarios (datos falsos por ahora)
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Juan', email: 'juan@email.com' },
    { id: 2, name: 'María', email: 'maria@email.com' }
  ];
  res.json({ users });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});