const express = require('express');
const { getAllUsers, createUser, getUserById } = require('../controllers/userController');
const { getPostsByUser } = require('../controllers/postController');

const router = express.Router();

// Rutas existentes
router.get('/', getAllUsers);
router.post('/', createUser);

// Nuevas rutas para perfiles
router.get('/:userId', getUserById);                    // Obtener info del usuario
router.get('/:userId/posts', getPostsByUser);           // Obtener posts del usuario

module.exports = router;