import { Router } from 'express';
import type { Request, Response } from 'express';
// Controller implementations
const getAllUsers = (req: Request, res: Response) => {
    // Example: Return a static list of users
    res.json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]);
};

const createUser = (req: Request, res: Response) => {
    // Example: Create a user from request body
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    // Simulate user creation
    const newUser = { id: Date.now(), name };
    res.status(201).json(newUser);
};

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);

export default router;
export { getAllUsers, createUser };