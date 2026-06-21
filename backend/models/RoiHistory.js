import mongoose from 'mongoose';

const { Schema } = mongoose;

const roiHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    investment: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
      index: true,
    },
    roiAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Credited', 'Failed', 'Reversed'],
      default: 'Credited',
    },
  },
  { timestamps: true }
);

roiHistorySchema.index({ investment: 1, date: 1 }, { unique: true });
roiHistorySchema.index({ user: 1, date: -1 });

const RoiHistory = mongoose.model('RoiHistory', roiHistorySchema);

export default RoiHistory;
