import User from '../models/User.js';

const toLawyerCard = (user) => {
  const id = user._id.toString();
  const yearsExperience = user.lawyerProfile?.yearsOfExperience ?? 0;
  const profileSpecialization = Array.isArray(user.lawyerProfile?.specialization)
    ? user.lawyerProfile.specialization
    : [];

  const deterministicSeed = parseInt(id.slice(-4), 16) || 0;
  const rating = Number((4 + (deterministicSeed % 11) / 10).toFixed(1));
  const matchScore = Math.min(99, 80 + yearsExperience);

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
    reviews: [],
  };
};

export const getLawyers = async (req, res) => {
  try {
    const users = await User.find({ role: 'lawyer' })
      .select('fullName lawyerProfile')
      .sort({ createdAt: 1 })
      .lean();

    const lawyers = users.map(toLawyerCard);
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

    const lawyer = toLawyerCard(user);
    return res.status(200).json({ lawyer });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    console.error('Get lawyer by id error:', error);
    return res.status(500).json({ message: 'Unable to fetch lawyer right now' });
  }
};
