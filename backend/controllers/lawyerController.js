import User from '../models/User.js';
import Request from '../models/Request.js';
import { getClientProfileCompletion } from '../utils/profileCompletion.js';

const AVAILABILITY_VALUES = ['available', 'busy', 'on_leave'];

const formatDuration = (ms) => {
  if (!ms || ms <= 0) {
    return 'N/A';
  }

  const totalMinutes = Math.round(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

const getProfileCompleteness = (lawyerProfile) => {
  const checks = [
    Boolean(lawyerProfile?.barLicenseNumber),
    Number.isFinite(lawyerProfile?.yearsOfExperience),
    Array.isArray(lawyerProfile?.specialization) && lawyerProfile.specialization.length > 0,
    Boolean(lawyerProfile?.officeLocation),
    Boolean(lawyerProfile?.bio),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const calculateVisibilityScore = ({ profileCompleteness, availability, rating, avgResponseMs }) => {
  const availabilityScore = availability === 'available' ? 100 : availability === 'busy' ? 60 : 30;
  const ratingScore = Math.min(100, Math.round((rating / 5) * 100));

  let responseTimeScore = 55;
  if (avgResponseMs) {
    const hours = avgResponseMs / (1000 * 60 * 60);
    if (hours <= 2) {
      responseTimeScore = 100;
    } else if (hours <= 6) {
      responseTimeScore = 85;
    } else if (hours <= 24) {
      responseTimeScore = 65;
    } else {
      responseTimeScore = 45;
    }
  }

  return Math.round(
    profileCompleteness * 0.4 + availabilityScore * 0.2 + ratingScore * 0.2 + responseTimeScore * 0.2
  );
};

const buildHistoryByLawyer = (requests) => {
  const historyMap = {};

  requests.forEach((request) => {
    const lawyerId = request?.lawyer?.toString();
    if (!lawyerId) return;

    if (!historyMap[lawyerId]) {
      historyMap[lawyerId] = {
        requestsReceived: 0,
        casesTaken: 0,
        casesWon: 0,
        activeCases: 0,
      };
    }

    const history = historyMap[lawyerId];
    history.requestsReceived += 1;

    if (request?.status === 'accepted') {
      history.casesTaken += 1;

      if (request?.case?.status === 'completed') {
        history.casesWon += 1;
      }

      if (
        request?.case?.status === 'accepted' ||
        request?.case?.status === 'in_progress' ||
        request?.case?.status === 'request_sent'
      ) {
        history.activeCases += 1;
      }
    }
  });

  Object.values(historyMap).forEach((history) => {
    history.acceptanceRate = history.requestsReceived
      ? Math.round((history.casesTaken / history.requestsReceived) * 100)
      : 0;
    history.completionRate = history.casesTaken
      ? Math.round((history.casesWon / history.casesTaken) * 100)
      : 0;
  });

  return historyMap;
};

const toLawyerCard = (user, historyByLawyer = {}) => {
  const id = user._id.toString();
  const yearsExperience = user.lawyerProfile?.yearsOfExperience ?? 0;
  const profileSpecialization = Array.isArray(user.lawyerProfile?.specialization)
    ? user.lawyerProfile.specialization
    : [];

  const deterministicSeed = parseInt(id.slice(-4), 16) || 0;
  const rating = Number((4 + (deterministicSeed % 11) / 10).toFixed(1));
  const matchScore = Math.min(99, 80 + yearsExperience);
  const history = historyByLawyer[id] || {
    requestsReceived: 0,
    casesTaken: 0,
    casesWon: 0,
    activeCases: 0,
    acceptanceRate: 0,
    completionRate: 0,
  };

  return {
    id,
    fullName: user.fullName,
    specialization: profileSpecialization,
    location: user.lawyerProfile?.officeLocation || 'Not specified',
    yearsExperience,
    rating,
    matchScore,
    verified: Boolean(user.lawyerProfile?.barLicenseNumber),
    bio: user.lawyerProfile?.bio || 'Law practitioner available for consultation.',
    availability: user.lawyerProfile?.availability || 'available',
    profileCompleteness: getProfileCompleteness(user.lawyerProfile),
    history,
    reviews: [],
  };
};

export const getLawyers = async (req, res) => {
  try {
    const users = await User.find({ role: 'lawyer' })
      .select('fullName lawyerProfile')
      .sort({ createdAt: 1 })
      .lean();

    const requests = await Request.find({ lawyer: { $in: users.map((user) => user._id) } })
      .select('lawyer status case')
      .populate({ path: 'case', select: 'status' })
      .lean();

    const historyByLawyer = buildHistoryByLawyer(requests);

    const lawyers = users.map((user) => toLawyerCard(user, historyByLawyer));
    return res.status(200).json({ lawyers });
  } catch (error) {
    console.error('Get lawyers error:', error);
    return res.status(500).json({ message: 'Unable to fetch lawyers right now' });
  }
};

export const getLawyerById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: 'lawyer' })
      .select('fullName lawyerProfile')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    const requests = await Request.find({ lawyer: user._id })
      .select('lawyer status case')
      .populate({ path: 'case', select: 'status' })
      .lean();

    const historyByLawyer = buildHistoryByLawyer(requests);

    const lawyer = toLawyerCard(user, historyByLawyer);
    return res.status(200).json({ lawyer });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    console.error('Get lawyer by id error:', error);
    return res.status(500).json({ message: 'Unable to fetch lawyer right now' });
  }
};

export const updateLawyerAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!AVAILABILITY_VALUES.includes(availability)) {
      return res
        .status(400)
        .json({ message: 'Availability must be one of: available, busy, on_leave' });
    }

    const lawyer = await User.findOne({ _id: req.user.id, role: 'lawyer' });
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    const lawyerProfile = lawyer.lawyerProfile || {};
    lawyerProfile.availability = availability;
    lawyer.lawyerProfile = lawyerProfile;

    await lawyer.save();

    return res.status(200).json({
      message: 'Availability updated successfully',
      availability,
      lawyerProfile: lawyer.lawyerProfile,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    return res.status(500).json({ message: 'Unable to update availability right now' });
  }
};

export const getLawyerDashboardMetrics = async (req, res) => {
  try {
    const lawyer = await User.findOne({ _id: req.user.id, role: 'lawyer' }).lean();

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    const responseRequests = await Request.find({
      lawyer: req.user.id,
      status: { $in: ['accepted', 'rejected'] },
      respondedAt: { $exists: true, $ne: null },
    })
      .select('createdAt respondedAt')
      .lean();

    const responseDurations = responseRequests
      .map((item) => new Date(item.respondedAt).getTime() - new Date(item.createdAt).getTime())
      .filter((value) => Number.isFinite(value) && value > 0);

    const avgResponseMs =
      responseDurations.length > 0
        ? responseDurations.reduce((sum, value) => sum + value, 0) / responseDurations.length
        : 0;

    const deterministicSeed = parseInt(lawyer._id.toString().slice(-4), 16) || 0;
    const rating = Number((4 + (deterministicSeed % 11) / 10).toFixed(1));
    const profileCompleteness = getProfileCompleteness(lawyer.lawyerProfile);
    const availability = lawyer.lawyerProfile?.availability || 'available';

    const visibilityScore = calculateVisibilityScore({
      profileCompleteness,
      availability,
      rating,
      avgResponseMs,
    });

    return res.status(200).json({
      metrics: {
        visibilityScore,
        profileCompleteness,
        availability,
        rating,
        avgResponseTime: formatDuration(avgResponseMs),
      },
    });
  } catch (error) {
    console.error('Get lawyer dashboard metrics error:', error);
    return res.status(500).json({ message: 'Unable to load dashboard metrics right now' });
  }
};

export const getClientProfileForLawyer = async (req, res) => {
  try {
    const { clientId } = req.params;

    const linkedRequest = await Request.findOne({
      lawyer: req.user.id,
      client: clientId,
    })
      .select('_id status createdAt')
      .lean();

    if (!linkedRequest) {
      return res.status(403).json({ message: 'You are not authorized to view this client profile' });
    }

    const client = await User.findOne({ _id: clientId, role: 'client' })
      .select('fullName email phone clientProfile createdAt')
      .lean();

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const completion = getClientProfileCompletion(client);

    return res.status(200).json({
      client: {
        id: client._id,
        fullName: client.fullName || '',
        email: client.email || '',
        phone: client.phone || '',
        location: client.clientProfile?.location || '',
        dateOfBirth: client.clientProfile?.dateOfBirth || null,
        gender: client.clientProfile?.gender || '',
        preferredLanguage: client.clientProfile?.preferredLanguage || '',
        bio: client.clientProfile?.bio || '',
        emergencyContactName: client.clientProfile?.emergencyContactName || '',
        emergencyContactPhone: client.clientProfile?.emergencyContactPhone || '',
        profileCompletion: completion.profileCompletion,
        isProfileComplete: completion.isProfileComplete,
      },
      linkedRequest,
    });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Client not found' });
    }

    console.error('Get client profile for lawyer error:', error);
    return res.status(500).json({ message: 'Unable to fetch client profile right now' });
  }
};
