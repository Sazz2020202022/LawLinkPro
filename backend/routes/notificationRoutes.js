import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMyNotifications, markNotificationRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markNotificationRead);

export default router;
