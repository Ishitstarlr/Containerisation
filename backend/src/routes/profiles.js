import express from 'express';
import { getProfile, updateProfile } from '../controllers/profiles.js';
import { authenticateUser, checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Both routes should use authentication
router.get('/profile', checkJwt, getProfile);
router.put('/profile', checkJwt, updateProfile); // Endpoint path must match frontend

export default router; 