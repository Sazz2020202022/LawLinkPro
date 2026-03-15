import Message from '../models/Message.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

const isRequestParticipant = (requestDoc, userId) => {
  const uid = String(userId);
  return String(requestDoc.client?._id || requestDoc.client) === uid || String(requestDoc.lawyer?._id || requestDoc.lawyer) === uid;
};

const getOtherParticipant = (requestDoc, userId) => {
  const uid = String(userId);
  return String(requestDoc.client?._id || requestDoc.client) === uid ? requestDoc.lawyer : requestDoc.client;
};

const getSenderName = (requestDoc, userId) => {
  const uid = String(userId);
  const isClientSender = String(requestDoc.client?._id || requestDoc.client) === uid;
  return isClientSender ? requestDoc.client?.fullName || 'Client' : requestDoc.lawyer?.fullName || 'Lawyer';
};

const getValidatedRequestContext = async (requestId, userId) => {
  const requestDoc = await Request.findById(requestId)
    .populate('client', 'fullName role')
    .populate('lawyer', 'fullName role')
    .populate('case', 'title status')
    .lean();

  if (!requestDoc) {
    return { error: { status: 404, message: 'Request not found' } };
  }

  if (!isRequestParticipant(requestDoc, userId)) {
    return { error: { status: 403, message: 'You are not allowed to access this conversation' } };
  }

  if (requestDoc.status !== 'accepted') {
    return { error: { status: 403, message: 'Messaging is available only for accepted requests' } };
  }

  return { requestDoc };
};

export const getMessagesByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const { requestDoc, error } = await getValidatedRequestContext(requestId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const messages = await Message.find({ request: requestId })
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role')
      .sort({ createdAt: 1 })
      .lean();

    const otherParticipant = getOtherParticipant(requestDoc, req.user.id);

    return res.status(200).json({
      request: {
        id: requestDoc._id,
        status: requestDoc.status,
        case: requestDoc.case,
        otherParticipant: {
          id: otherParticipant?._id,
          fullName: otherParticipant?.fullName || 'Participant',
          role: otherParticipant?.role,
        },
      },
      messages,
    });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Unable to fetch messages right now' });
  }
};

export const sendMessageByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const { requestDoc, error } = await getValidatedRequestContext(requestId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const otherParticipant = getOtherParticipant(requestDoc, req.user.id);
    const senderName = getSenderName(requestDoc, req.user.id);

    const message = await Message.create({
      case: requestDoc.case?._id || requestDoc.case,
      request: requestDoc._id,
      sender: req.user.id,
      receiver: otherParticipant?._id,
      text: String(text).trim(),
      attachments: [],
      readBy: [req.user.id],
    });

    await Request.findByIdAndUpdate(requestDoc._id, { latestMessageAt: new Date() });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role')
      .lean();

    await Notification.create({
      recipient: otherParticipant?._id,
      type: 'message_received',
      title: 'New message received',
      message: `${senderName} • ${requestDoc.case?.title || 'Case conversation'}`,
      request: requestDoc._id,
      case: requestDoc.case?._id || requestDoc.case,
    });

    return res.status(201).json({ message: populated });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Unable to send message right now' });
  }
};

export const sendMessageAttachmentByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const text = String(req.body?.text || '').trim();
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({ message: 'Please attach at least one file' });
    }

    const { requestDoc, error } = await getValidatedRequestContext(requestId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const otherParticipant = getOtherParticipant(requestDoc, req.user.id);
    const senderName = getSenderName(requestDoc, req.user.id);
    const attachments = files.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${String(file.filename || '').replace(/\\/g, '/')}`,
    }));

    const message = await Message.create({
      case: requestDoc.case?._id || requestDoc.case,
      request: requestDoc._id,
      sender: req.user.id,
      receiver: otherParticipant?._id,
      text,
      attachments,
      readBy: [req.user.id],
    });

    await Request.findByIdAndUpdate(requestDoc._id, { latestMessageAt: new Date() });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role')
      .lean();

    await Notification.create({
      recipient: otherParticipant?._id,
      type: 'message_received',
      title: 'New attachment message',
      message: `${senderName} shared ${attachments.length} file${attachments.length > 1 ? 's' : ''}`,
      request: requestDoc._id,
      case: requestDoc.case?._id || requestDoc.case,
    });

    return res.status(201).json({ message: populated });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.error('Send message attachment error:', error);
    return res.status(500).json({ message: 'Unable to send attachment right now' });
  }
};

export const markMessagesReadByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const { requestDoc, error } = await getValidatedRequestContext(requestId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const updateResult = await Message.updateMany(
      {
        request: requestDoc._id,
        readBy: { $ne: req.user.id },
      },
      {
        $addToSet: { readBy: req.user.id },
      }
    );

    return res.status(200).json({
      message: 'Messages marked as read',
      modifiedCount: updateResult.modifiedCount || 0,
    });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.error('Mark messages read error:', error);
    return res.status(500).json({ message: 'Unable to mark messages as read right now' });
  }
};
