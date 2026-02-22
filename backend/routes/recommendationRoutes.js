import express from 'express';
import { authenticate, clientOnly } from '../middleware/auth.js';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/:caseId', authenticate, clientOnly, getRecommendations);

export default router;
