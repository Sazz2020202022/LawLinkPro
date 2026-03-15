import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMessagesByRequest,
  sendMessageByRequest,
  markMessagesReadByRequest,
  sendMessageAttachmentByRequest,
} from '../controllers/messageController.js';
import { uploadCaseDocumentMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.get('/:requestId', authenticate, getMessagesByRequest);
router.post('/:requestId', authenticate, sendMessageByRequest);
router.post(
  '/:requestId/attachment',
  authenticate,
  uploadCaseDocumentMiddleware.array('attachments', 3),
  sendMessageAttachmentByRequest
);
router.patch('/:requestId/read', authenticate, markMessagesReadByRequest);

export default router;
