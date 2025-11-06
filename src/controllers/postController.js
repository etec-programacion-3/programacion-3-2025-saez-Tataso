const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo post
const createPost = async (req, res) => {
  try {
    const {content } = req.body;
    const authorId = req.user.userId;

    const post = await prisma.post.create({
      data: {
        content,
        authorId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        likes: true,
        comments: true
      }
    });

    res.status(201).json({
      message: 'Post creado exitosamente',
      post: {
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLikedByCurrentUser: false,
        likes: undefined,
        comments: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los posts
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        likes: true,
        comments: true
      }
    });

    const postsWithMetadata = posts.map(post => ({
      ...post,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: userId 
        ? post.likes.some(like => like.userId === userId)
        : false,
      likes: undefined,
      comments: undefined
    }));

    res.json({ posts: postsWithMetadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar un post que no es tuyo' });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener posts de un usuario específico
const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        likes: true,
        comments: true
      }
    });

    const postsWithMetadata = posts.map(post => ({
      ...post,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: currentUserId
        ? post.likes.some(like => like.userId === currentUserId)
        : false,
      likes: undefined,
      comments: undefined
    }));

    res.json({ 
      posts: postsWithMetadata,
      count: posts.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  createPost, 
  getAllPosts, 
  deletePost,
  getPostsByUser
};