import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    latestMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
