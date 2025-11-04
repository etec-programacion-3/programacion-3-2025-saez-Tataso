const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo post
const createPost = async (req, res) => {
  try {
    const {content } = req.body;
    const authorId = req.user.userId; // Del middleware de autenticación

    const post = await prisma.post.create({
      data: {
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

// Obtener todos los posts de un usuario específico
const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener posts del usuario
    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ 
      posts,
      count: posts.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el module.exports:
module.exports = { 
  createPost, 
  getAllPosts, 
  deletePost,
  getPostsByUser
};