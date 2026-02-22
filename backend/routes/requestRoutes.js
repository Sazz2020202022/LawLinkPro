import express from 'express';
import { authenticate, clientOnly, lawyerOnly } from '../middleware/auth.js';
import {
  createRequest,
  getClientRequests,
  getLawyerRequests,
  updateRequestStatus,
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', authenticate, clientOnly, createRequest);
router.get('/client', authenticate, clientOnly, getClientRequests);
router.get('/lawyer', authenticate, lawyerOnly, getLawyerRequests);
router.patch('/:id', authenticate, lawyerOnly, updateRequestStatus);

export default router;
