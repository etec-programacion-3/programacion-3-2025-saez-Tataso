const jwt = require('jsonwebtoken');

const JWT_SECRET = '277353'; // Igual que en authController

const authenticateToken = (req, res, next) => {
  // Obtener token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  // Verificar token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    // Agregar datos del usuario a la request
    req.user = user;
    next(); // Continuar a la siguiente función
  });
};

module.exports = { authenticateToken };