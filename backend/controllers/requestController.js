import Request from '../models/Request.js';
import Case from '../models/Case.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createRequest = async (req, res) => {
  try {
    const { caseId, lawyerId, message } = req.body;

    if (!caseId || !lawyerId) {
      return res.status(400).json({ message: 'Case ID and Lawyer ID are required' });
    }

    // Verify case belongs to client
    const caseDoc = await Case.findOne({ _id: caseId, client: req.user.id });

    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Verify lawyer exists
    const lawyer = await User.findOne({ _id: lawyerId, role: 'lawyer' });

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // Check for duplicate pending request
    const existingRequest = await Request.findOne({
      client: req.user.id,
      lawyer: lawyerId,
      case: caseId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request to this lawyer for this case' });
    }

    const newRequest = await Request.create({
      client: req.user.id,
      lawyer: lawyerId,
      case: caseId,
      message: message?.trim() || '',
      status: 'pending',
    });

    await Notification.create({
      recipient: lawyerId,
      type: 'request_sent',
      title: 'New request received',
      message: `You received a request for case "${caseDoc.title}"`,
      request: newRequest._id,
      case: caseDoc._id,
    });

    return res.status(201).json({ request: newRequest });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    console.error('Create request error:', error);
    return res.status(500).json({ message: 'Unable to create request right now' });
  }
};

export const getClientRequests = async (req, res) => {
  try {
    const requests = await Request.find({ client: req.user.id })
      .populate('lawyer', 'fullName email lawyerProfile')
      .populate('case', 'title category description status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error('Get client requests error:', error);
    return res.status(500).json({ message: 'Unable to fetch requests right now' });
  }
};

export const getLawyerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ lawyer: req.user.id })
      .populate('client', 'fullName email phone')
      .populate('case', 'title category description status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error('Get lawyer requests error:', error);
    return res.status(500).json({ message: 'Unable to fetch requests right now' });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "accepted" or "rejected"' });
    }

    const request = await Request.findOne({ _id: id, lawyer: req.user.id });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      const relatedCase = await Case.findById(request.case).select('title').lean();

      await Notification.create({
        recipient: request.client,
        type: 'request_accepted',
        title: 'Request accepted',
        message: `Your request was accepted${relatedCase?.title ? ` for case "${relatedCase.title}"` : ''}`,
        request: request._id,
        case: request.case,
      });
    }

    return res.status(200).json({ request });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.error('Update request status error:', error);
    return res.status(500).json({ message: 'Unable to update request right now' });
  }
};
