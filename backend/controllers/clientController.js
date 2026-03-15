import User from '../models/User.js';
import { getClientProfileCompletion } from '../utils/profileCompletion.js';

const PICKED_FIELDS = [
  'fullName',
  'phone',
  'location',
  'dateOfBirth',
  'gender',
  'preferredLanguage',
  'bio',
  'emergencyContactName',
  'emergencyContactPhone',
];

export const getClientProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'client' }).lean();

    if (!user) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const completion = getClientProfileCompletion(user);

    return res.status(200).json({
      profile: {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.clientProfile?.location || '',
        dateOfBirth: user.clientProfile?.dateOfBirth || null,
        gender: user.clientProfile?.gender || '',
        preferredLanguage: user.clientProfile?.preferredLanguage || '',
        bio: user.clientProfile?.bio || '',
        emergencyContactName: user.clientProfile?.emergencyContactName || '',
        emergencyContactPhone: user.clientProfile?.emergencyContactPhone || '',
      },
      ...completion,
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    return res.status(500).json({ message: 'Unable to fetch client profile right now' });
  }
};

export const updateClientProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'client' });

    if (!user) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const payload = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => PICKED_FIELDS.includes(key))
    );

    if (typeof payload.fullName === 'string') {
      user.fullName = payload.fullName.trim();
    }

    if (typeof payload.phone === 'string') {
      user.phone = payload.phone.trim();
    }

    const nextClientProfile = {
      ...(user.clientProfile?.toObject?.() || user.clientProfile || {}),
    };

    if (typeof payload.location === 'string') {
      nextClientProfile.location = payload.location.trim();
    }
    if (typeof payload.gender === 'string') {
      nextClientProfile.gender = payload.gender.trim();
    }
    if (typeof payload.preferredLanguage === 'string') {
      nextClientProfile.preferredLanguage = payload.preferredLanguage.trim();
    }
    if (typeof payload.bio === 'string') {
      nextClientProfile.bio = payload.bio.trim();
    }
    if (typeof payload.emergencyContactName === 'string') {
      nextClientProfile.emergencyContactName = payload.emergencyContactName.trim();
    }
    if (typeof payload.emergencyContactPhone === 'string') {
      nextClientProfile.emergencyContactPhone = payload.emergencyContactPhone.trim();
    }
    if (payload.dateOfBirth) {
      const parsedDate = new Date(payload.dateOfBirth);
      if (!Number.isNaN(parsedDate.getTime())) {
        nextClientProfile.dateOfBirth = parsedDate;
      }
    }

    user.clientProfile = nextClientProfile;

    await user.save();

    const completion = getClientProfileCompletion(user);

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.clientProfile?.location || '',
        dateOfBirth: user.clientProfile?.dateOfBirth || null,
        gender: user.clientProfile?.gender || '',
        preferredLanguage: user.clientProfile?.preferredLanguage || '',
        bio: user.clientProfile?.bio || '',
        emergencyContactName: user.clientProfile?.emergencyContactName || '',
        emergencyContactPhone: user.clientProfile?.emergencyContactPhone || '',
      },
      ...completion,
    });
  } catch (error) {
    console.error('Update client profile error:', error);
    return res.status(500).json({ message: 'Unable to update profile right now' });
  }
};

export const getClientProfileCompletionStatus = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id, role: 'client' }).lean();

    if (!user) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    return res.status(200).json(getClientProfileCompletion(user));
  } catch (error) {
    console.error('Get profile completion error:', error);
    return res.status(500).json({ message: 'Unable to fetch profile completion right now' });
  }
};
