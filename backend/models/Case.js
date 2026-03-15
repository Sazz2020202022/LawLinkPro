import mongoose from 'mongoose';

const caseDocumentSchema = new mongoose.Schema(
  {
    // Original file name uploaded by the client.
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    // Public URL path served from /uploads.
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    incidentDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    budgetRange: {
      type: String,
      trim: true,
    },
    opposingParty: {
      type: String,
      trim: true,
    },
    preferredContactTime: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'matched', 'request_sent', 'accepted', 'in_progress', 'completed'],
      default: 'submitted',
    },
    // Lightweight system-generated summary shown on case detail page.
    aiSummary: {
      type: String,
      trim: true,
    },
    documents: {
      type: [caseDocumentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Case = mongoose.model('Case', caseSchema);

export default Case;
