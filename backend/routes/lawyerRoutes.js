import express from 'express';
import {
	getLawyerById,
	getLawyers,
	updateLawyerAvailability,
	getLawyerDashboardMetrics,
	getClientProfileForLawyer,
} from '../controllers/lawyerController.js';
import { authenticate, lawyerOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getLawyers);
router.get('/dashboard/metrics', authenticate, lawyerOnly, getLawyerDashboardMetrics);
router.patch('/profile/availability', authenticate, lawyerOnly, updateLawyerAvailability);
router.get('/clients/:clientId', authenticate, lawyerOnly, getClientProfileForLawyer);
router.get('/:id', getLawyerById);

export default router;
