import { Router } from 'express';
import { 
  createInspection, 
  getInspections, 
  getInspectionById, 
  updateInspection, 
  getAnalyticsSummary 
} from '../controllers/inspectionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, inspectionRequestSchema, updateInspectionSchema } from '../middleware/validateMiddleware.js';

const router = Router();

// All inspection routes require JWT authentication
router.use(authenticateToken);

// Core inspection endpoint
router.post('/inspect', validate(inspectionRequestSchema), createInspection);

// History and detailed views
router.get('/inspections', getInspections);
router.get('/inspections/:id', getInspectionById);
router.patch('/inspections/:id', validate(updateInspectionSchema), updateInspection);

// Analytics
router.get('/analytics/summary', getAnalyticsSummary);

export default router;

