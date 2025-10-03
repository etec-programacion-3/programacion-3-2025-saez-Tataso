const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = 'tu-clave-secreta-super-segura';

// Registrar usuario
const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validar dominio del email
    if (!email.endsWith('@alumno.etec.um.edu.ar'|| '@etec.um.edu.ar')) {
      return res.status(400).json({ 
        error: 'Solo se permiten registros con emails de la Etec' 
      });
    }

    // Verificar que el email no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };