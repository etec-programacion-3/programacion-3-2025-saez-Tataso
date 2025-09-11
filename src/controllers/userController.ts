import type { Request, Response } from 'express';

const getAllUsers = (req: Request, res: Response) => {
  // Por ahora, datos falsos
  const users = [
    { id: 1, name: 'Juan', email: 'juan@email.com' },
    { id: 2, name: 'María', email: 'maria@email.com' }
  ];
  
  res.json({ users });
};

const createUser = (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  res.json({ 
    message: 'Usuario creado',
    user: { id: 3, name, email }
  });
};

module.exports = {
  getAllUsers,
  createUser
};