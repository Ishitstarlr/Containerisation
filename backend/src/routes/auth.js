import express from 'express';
import { register, getCurrentUser, updateUser } from '../controllers/auth.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);

// Protected routes
router.get('/user', checkJwt, getCurrentUser);
router.put('/user', checkJwt, updateUser);

export default router; 