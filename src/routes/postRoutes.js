const express = require('express');
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const { likePost, unlikePost } = require('../controllers/LikeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createPost);
router.get('/', authenticateToken, getAllPosts);
router.delete('/:id', authenticateToken, deletePost);

// ← ESTAS LÍNEAS
router.post('/:id/like', authenticateToken, likePost);
router.delete('/:id/like', authenticateToken, unlikePost);

module.exports = router;