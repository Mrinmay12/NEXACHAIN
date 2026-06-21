import asyncHandler from 'express-async-handler';
import Investment from '../models/Investment.js';
import RoiHistory from '../models/RoiHistory.js';
import ReferralIncome from '../models/ReferralIncome.js';


export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [investmentAgg, todayRoiAgg] = await Promise.all([
    Investment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalInvestments: { $sum: '$investmentAmount' },
          activeInvestments: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] },
          },
          investmentCount: { $sum: 1 },
        },
      },
    ]),
    RoiHistory.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
          },
        },
      },
      { $group: { _id: null, todayRoi: { $sum: '$roiAmount' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalInvestments: investmentAgg[0]?.totalInvestments || 0,
      activeInvestmentCount: investmentAgg[0]?.activeInvestments || 0,
      investmentCount: investmentAgg[0]?.investmentCount || 0,
      todayRoi: todayRoiAgg[0]?.todayRoi || 0,
      totalRoiEarned: req.user.totalRoiEarned,
      totalLevelIncomeEarned: req.user.totalLevelIncomeEarned,
      walletBalance: req.user.walletBalance,
    },
  });
});


export const getRoiHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    RoiHistory.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('investment', 'planDetails investmentAmount')
      .lean(),
    RoiHistory.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    data: history,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});


export const getReferralIncomeHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    ReferralIncome.find({ beneficiary: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sourceUser', 'fullName email')
      .lean(),
    ReferralIncome.countDocuments({ beneficiary: req.user._id }),
  ]);

  res.json({
    success: true,
    data: history,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
