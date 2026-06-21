import express from 'express';
import { createInvestment, getMyInvestments } from '../controllers/investmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createInvestment);
router.get('/', getMyInvestments);

export default router;
