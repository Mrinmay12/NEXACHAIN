import User from '../models/User.js';
import ReferralIncome from '../models/ReferralIncome.js';

const getLevelPercentages = () => {
  const levels = Number(process.env.REFERRAL_LEVELS || 5);
  const raw = process.env.REFERRAL_LEVEL_PERCENTAGES || '5,3,2,1,1';
  const percentages = raw.split(',').map((v) => Number(v.trim()));

  if (percentages.length !== levels) {
    throw new Error(
      'REFERRAL_LEVEL_PERCENTAGES count does not match REFERRAL_LEVELS in environment config'
    );
  }
  return percentages;
};


export const distributeLevelIncome = async ({
  sourceUser,
  sourceInvestment,
  baseAmount,
  date,
  session = null,
}) => {
  const percentages = getLevelPercentages();
  const results = [];

  let currentUserId = sourceUser;

  for (let level = 1; level <= percentages.length; level += 1) {
    // eslint-disable-next-line no-await-in-loop
    const currentUser = await User.findById(currentUserId).session(session);
    if (!currentUser || !currentUser.referredBy) break; // no more upline

    const uplineId = currentUser.referredBy;

    const upline = await User.findById(uplineId).session(session);
    if (!upline || upline.accountStatus !== 'Active') {
      currentUserId = uplineId;
     
      continue;
    }

    const percentage = percentages[level - 1];
    const incomeAmount = Number(((baseAmount * percentage) / 100).toFixed(2));

    if (incomeAmount > 0) {
      try {
     
        await ReferralIncome.create(
          [
            {
              beneficiary: upline._id,
              sourceUser,
              sourceInvestment,
              level,
              incomeAmount,
              date,
            },
          ],
          { session }
        );

        // eslint-disable-next-line no-await-in-loop
        await User.findByIdAndUpdate(
          upline._id,
          {
            $inc: {
              walletBalance: incomeAmount,
              totalLevelIncomeEarned: incomeAmount,
            },
          },
          { session }
        );

        results.push({ beneficiary: upline._id, level, incomeAmount });
      } catch (err) {
        // Duplicate key = already credited for this exact event; skip.
        if (err.code !== 11000) throw err;
      }
    }

    currentUserId = uplineId;
  }

  return results;
};


export const getDirectReferrals = async (userId) => {
  return User.find({ referredBy: userId }).select(
    'fullName email mobileNumber walletBalance accountStatus createdAt'
  );
};

export const getReferralTree = async (userId, maxDepth = 10) => {
  const buildNode = async (id, depth) => {
    const user = await User.findById(id).select('fullName email referralCode createdAt');
    if (!user) return null;

    if (depth >= maxDepth) {
      return { ...user.toObject(), children: [] };
    }

    const children = await User.find({ referredBy: id }).select(
      'fullName email referralCode createdAt'
    );

    const childNodes = await Promise.all(
      children.map((child) => buildNode(child._id, depth + 1))
    );

    return { ...user.toObject(), children: childNodes.filter(Boolean) };
  };

  return buildNode(userId, 0);
};
