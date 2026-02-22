import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'matched', 'in_progress', 'completed'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

const Case = mongoose.model('Case', caseSchema);

export default Case;
