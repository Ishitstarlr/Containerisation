import express from 'express';
import { getEventProjects, submitProject } from '../controllers/projects.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, projectSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/events/:eventId/projects', authenticateUser, getEventProjects);
router.post('/projects', authenticateUser, validate(projectSchema), submitProject);

export default router; 