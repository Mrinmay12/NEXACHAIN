import mongoose from 'mongoose';

const { Schema } = mongoose;

const referralIncomeSchema = new Schema(
  {
  
    beneficiary: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    sourceUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    sourceInvestment: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    incomeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

referralIncomeSchema.index(
  { sourceInvestment: 1, beneficiary: 1, level: 1, date: 1 },
  { unique: true }
);

referralIncomeSchema.index({ beneficiary: 1, date: -1 });

const ReferralIncome = mongoose.model('ReferralIncome', referralIncomeSchema);

export default ReferralIncome;
