import express from 'express';
import { fetchDirectReferrals, fetchReferralTree } from '../controllers/referralController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/direct', fetchDirectReferrals);
router.get('/tree', fetchReferralTree);

export default router;
