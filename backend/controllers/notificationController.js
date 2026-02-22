import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.reduce((count, item) => (item.read ? count : count + 1), 0);

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Unable to fetch notifications right now' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, recipient: req.user.id });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.status(200).json({ notification });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Unable to update notification right now' });
  }
};
