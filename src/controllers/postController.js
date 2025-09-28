const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo post
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.userId; // Del middleware de autenticación

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Post creado exitosamente',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un post (solo el autor puede hacerlo)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar el post
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Verificar que el usuario sea el autor
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar un post que no es tuyo' });
    }

    // Eliminar el post
    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPost, getAllPosts, deletePost };