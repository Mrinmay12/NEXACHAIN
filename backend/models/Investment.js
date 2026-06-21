import mongoose from 'mongoose';

const { Schema } = mongoose;

const investmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    investmentAmount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [1, 'Investment amount must be greater than 0'],
    },
    planDetails: {
      name: { type: String, required: true, trim: true },
      durationInDays: { type: Number, required: true, min: 1 },
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyRoiPercentage: {
      type: Number,
      required: [true, 'Daily ROI percentage is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
      index: true,
    },

    lastRoiProcessedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


investmentSchema.index({ status: 1, endDate: 1 });
investmentSchema.index({ user: 1, status: 1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
