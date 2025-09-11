const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'Si te vas a /api/users, vas a poder ver un usuario obviamente imaginario. La nota me dirá si te parece piola.' });
});

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear usuario
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await prisma.user.create({
      data: { name, email, password }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});