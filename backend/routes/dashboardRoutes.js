import express from 'express';
import {
  getDashboardSummary,
  getRoiHistory,
  getReferralIncomeHistory,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/roi-history', getRoiHistory);
router.get('/referral-income-history', getReferralIncomeHistory);

export default router;
