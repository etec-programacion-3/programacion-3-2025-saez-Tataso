const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los comentarios de un post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        likes: true
      }
    });

    // Agregar metadata de likes
    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      likesCount: comment.likes.length,
      isLikedByCurrentUser: userId 
        ? comment.likes.some(like => like.userId === userId)
        : false,
      likes: undefined
    }));

    res.json({
      success: true,
      count: commentsWithLikes.length,
      comments: commentsWithLikes
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear un comentario en un post
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El contenido del comentario no puede estar vacío' });
    }

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: userId,
        postId: parseInt(postId)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        likes: true
      }
    });

    const commentsCount = await prisma.comment.count({
      where: { postId: parseInt(postId) }
    });

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      comment: {
        ...comment,
        likesCount: 0,
        isLikedByCurrentUser: false,
        likes: undefined
      },
      commentsCount
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un comentario
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar un comentario que no es tuyo' });
    }

    const postId = comment.postId;

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    const commentsCount = await prisma.comment.count({
      where: { postId: postId }
    });

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      commentsCount
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Dar like a un comentario
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId)
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Ya diste like a este comentario' });
    }

    const like = await prisma.commentLike.create({
      data: {
        userId: userId,
        commentId: parseInt(commentId)
      }
    });

    const likesCount = await prisma.commentLike.count({
      where: { commentId: parseInt(commentId) }
    });

    res.status(201).json({
      success: true,
      message: 'Like agregado al comentario',
      like,
      likesCount
    });
  } catch (error) {
    console.error('Error en likeComment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Quitar like de un comentario
const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId)
        }
      }
    });

    if (!like) {
      return res.status(404).json({ error: 'No has dado like a este comentario' });
    }

    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId)
        }
      }
    });

    const likesCount = await prisma.commentLike.count({
      where: { commentId: parseInt(commentId) }
    });

    res.json({
      success: true,
      message: 'Like eliminado del comentario',
      likesCount
    });
  } catch (error) {
    console.error('Error en unlikeComment:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment
};