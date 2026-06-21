import asyncHandler from 'express-async-handler';
import Investment from '../models/Investment.js';

export const createInvestment = asyncHandler(async (req, res) => {
  const { investmentAmount, planName, durationInDays, dailyRoiPercentage } = req.body;

  if (!investmentAmount || !planName || !durationInDays || dailyRoiPercentage == null) {
    res.status(400);
    throw new Error(
      'Please provide investmentAmount, planName, durationInDays and dailyRoiPercentage'
    );
  }

  if (investmentAmount <= 0) {
    res.status(400);
    throw new Error('investmentAmount must be greater than 0');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(durationInDays));

  const investment = await Investment.create({
    user: req.user._id,
    investmentAmount,
    planDetails: { name: planName, durationInDays },
    startDate,
    endDate,
    dailyRoiPercentage,
    status: 'Active',
  });

  res.status(201).json({ success: true, data: investment });
});


export const getMyInvestments = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [investments, total] = await Promise.all([
    Investment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Investment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: investments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
