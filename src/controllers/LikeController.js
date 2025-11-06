const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dar like a un post
const likePost = async (req, res) => {
  try {
    const { id } = req.params; // ID del post
    const userId = req.user.userId; // Del middleware de autenticación

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Verificar si ya dio like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(id)
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Ya diste like a este post' });
    }

    // Crear el like
    const like = await prisma.like.create({
      data: {
        userId: userId,
        postId: parseInt(id)
      }
    });

    // Obtener el conteo actualizado de likes
    const likesCount = await prisma.like.count({
      where: { postId: parseInt(id) }
    });

    res.status(201).json({
      message: 'Like agregado',
      like,
      likesCount
    });
  } catch (error) {
    console.error('Error en likePost:', error);
    res.status(500).json({ error: error.message });
  }
};

// Quitar like de un post
const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar el like
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(id)
        }
      }
    });

    if (!like) {
      return res.status(404).json({ error: 'No has dado like a este post' });
    }

    // Eliminar el like
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(id)
        }
      }
    });

    // Obtener el conteo actualizado
    const likesCount = await prisma.like.count({
      where: { postId: parseInt(id) }
    });

    res.json({
      message: 'Like eliminado',
      likesCount
    });
  } catch (error) {
    console.error('Error en unlikePost:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  likePost,
  unlikePost
};