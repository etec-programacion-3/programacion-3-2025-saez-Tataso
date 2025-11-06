const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los comentarios de un post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Obtener comentarios
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      count: comments.length,
      comments
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

    // Validar contenido
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El contenido del comentario no puede estar vacío' });
    }

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: userId,
        postId: parseInt(postId)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Obtener conteo actualizado
    const commentsCount = await prisma.comment.count({
      where: { postId: parseInt(postId) }
    });

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      comment,
      commentsCount
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un comentario (solo el autor)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Buscar el comentario
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar que el usuario es el autor
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar un comentario que no es tuyo' });
    }

    // Guardar postId antes de eliminar
    const postId = comment.postId;

    // Eliminar comentario
    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    // Obtener conteo actualizado
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

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment
};