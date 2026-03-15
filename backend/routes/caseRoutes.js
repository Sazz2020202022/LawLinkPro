import express from 'express';
import { authenticate, clientOnly } from '../middleware/auth.js';
import {
	createCase,
	getMyCases,
	getCaseById,
	uploadCaseDocument,
} from '../controllers/caseController.js';
import { uploadCaseDocumentMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticate, clientOnly, uploadCaseDocumentMiddleware.single('document'), createCase);
router.get('/my', authenticate, clientOnly, getMyCases);
router.get('/:id', authenticate, clientOnly, getCaseById);
router.post(
	'/:id/documents',
	authenticate,
	clientOnly,
	uploadCaseDocumentMiddleware.single('document'),
	uploadCaseDocument
);

export default router;
