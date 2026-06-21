import asyncHandler from 'express-async-handler';
import { getDirectReferrals, getReferralTree } from '../services/referralService.js';


export const fetchDirectReferrals = asyncHandler(async (req, res) => {
  const referrals = await getDirectReferrals(req.user._id);
  res.json({ success: true, count: referrals.length, data: referrals });
});

export const fetchReferralTree = asyncHandler(async (req, res) => {
  const tree = await getReferralTree(req.user._id);
  res.json({ success: true, data: tree });
});
