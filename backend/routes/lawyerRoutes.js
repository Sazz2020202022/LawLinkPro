import express from 'express';
import { getLawyerById, getLawyers } from '../controllers/lawyerController.js';

const router = express.Router();

router.get('/', getLawyers);
router.get('/:id', getLawyerById);

export default router;
