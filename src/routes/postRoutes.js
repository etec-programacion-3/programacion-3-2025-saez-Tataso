const express = require('express');
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const { likePost, unlikePost } = require('../controllers/likeController');
const { 
  getCommentsByPost, 
  createComment, 
  deleteComment,
  likeComment,
  unlikeComment 
} = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Posts
router.post('/', authenticateToken, createPost);
router.get('/', authenticateToken, getAllPosts);
router.delete('/:id', authenticateToken, deletePost);

// Likes en Posts
router.post('/:id/like', authenticateToken, likePost);
router.delete('/:id/like', authenticateToken, unlikePost);

// Comentarios
router.get('/:postId/comments', authenticateToken, getCommentsByPost);
router.post('/:postId/comments', authenticateToken, createComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

// Likes en Comentarios
router.post('/comments/:commentId/like', authenticateToken, likeComment);
router.delete('/comments/:commentId/like', authenticateToken, unlikeComment);

module.exports = router;