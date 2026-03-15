import mongoose from 'mongoose';

const messageAttachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [messageAttachmentSchema],
      default: [],
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
