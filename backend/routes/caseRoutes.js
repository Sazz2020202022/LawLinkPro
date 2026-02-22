import express from 'express';
import { authenticate, clientOnly } from '../middleware/auth.js';
import { createCase, getMyCases, getCaseById } from '../controllers/caseController.js';

const router = express.Router();

router.post('/', authenticate, clientOnly, createCase);
router.get('/my', authenticate, clientOnly, getMyCases);
router.get('/:id', authenticate, clientOnly, getCaseById);

export default router;
