import express from 'express';
import { authenticate, clientOnly } from '../middleware/auth.js';
import {
  getClientProfile,
  updateClientProfile,
  getClientProfileCompletionStatus,
} from '../controllers/clientController.js';

const router = express.Router();

router.get('/profile', authenticate, clientOnly, getClientProfile);
router.patch('/profile', authenticate, clientOnly, updateClientProfile);
router.get('/profile/completion', authenticate, clientOnly, getClientProfileCompletionStatus);

export default router;
