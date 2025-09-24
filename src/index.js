const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Importar rutas y middleware
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Ruta básica (pública)
app.get('/', (req, res) => {
  res.json({ message: '¡API con autenticación funcionando!' });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Rutas PROTEGIDAS - requieren JWT
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ 
      message: `Hola ${req.user.email}!`,
      users 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener perfil del usuario logueado
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});