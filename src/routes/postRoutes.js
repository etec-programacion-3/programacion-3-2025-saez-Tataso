const express = require('express');
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Crear post (protegido)
router.post('/', authenticateToken, createPost);

// Obtener todos los posts (público)
router.get('/', getAllPosts);

// Eliminar post (protegido - solo el autor)
router.delete('/:id', authenticateToken, deletePost);

module.exports = router;