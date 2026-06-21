import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import generateReferralCode from '../utils/generateReferralCode.js';


export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, password, referralCode } = req.body;

  if (!fullName || !email || !mobileNumber || !password) {
    res.status(400);
    throw new Error('Please provide fullName, email, mobileNumber and password');
  }

  const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (userExists) {
    res.status(409);
    throw new Error('A user with this email or mobile number already exists');
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) {
      res.status(400);
      throw new Error('Invalid referral code');
    }
    referredBy = referrer._id;
  }

  const newReferralCode = await generateReferralCode();

  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    password,
    referralCode: newReferralCode,
    referredBy,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.accountStatus !== 'Active') {
    res.status(403);
    throw new Error(`Account is ${user.accountStatus.toLowerCase()}`);
  }

  res.json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});


export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
