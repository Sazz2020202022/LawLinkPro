import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ALLOWED_SPECIALIZATIONS = [
  'Family Law',
  'Criminal Law',
  'Property Law',
  'Cyber Law',
  'Corporate Law',
  'Immigration Law',
  'Labour Law',
  'Tax Law',
];

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(user.role === 'lawyer' && { lawyerProfile: user.lawyerProfile }),
    },
    token,
  };
};

const validateRegisterBody = (body) => {
  const {
    fullName,
    email,
    phone,
    password,
    role = 'client',
    barLicenseNumber,
    yearsOfExperience,
    specialization,
    officeLocation,
    bio,
  } = body;

  if (!fullName || fullName.trim().length < 3) {
    return 'Full name must be at least 3 characters';
  }

  if (!email || !EMAIL_REGEX.test(String(email).toLowerCase())) {
    return 'Please provide a valid email address';
  }

  if (!phone || !PHONE_REGEX.test(String(phone).trim())) {
    return 'Phone number must be 7 to 15 digits and may start with +';
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character';
  }

  if (!['client', 'lawyer'].includes(role)) {
    return 'Invalid role selected';
  }

  if (role === 'lawyer') {
    if (!barLicenseNumber || !String(barLicenseNumber).trim()) {
      return 'Bar license number is required for lawyers';
    }

    const years = Number(yearsOfExperience);
    if (Number.isNaN(years) || years < 0 || years > 60) {
      return 'Years of experience must be between 0 and 60';
    }

    if (!Array.isArray(specialization) || specialization.length === 0) {
      return 'At least one specialization is required for lawyers';
    }

    const hasInvalidSpecialization = specialization.some(
      (item) => !ALLOWED_SPECIALIZATIONS.includes(item)
    );
    if (hasInvalidSpecialization) {
      return 'One or more selected specializations are invalid';
    }

    if (!officeLocation || !String(officeLocation).trim()) {
      return 'Office location is required for lawyers';
    }

    if (!bio || String(bio).trim().length < 30) {
      return 'Bio must be at least 30 characters for lawyers';
    }
  }

  return null;
};

export const register = async (req, res) => {
  try {
    const validationError = validateRegisterBody(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const {
      fullName,
      email,
      phone,
      password,
      role,
      barLicenseNumber,
      yearsOfExperience,
      specialization,
      officeLocation,
      bio,
    } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const userPayload = {
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      role,
      passwordHash: password,
    };

    if (role === 'lawyer') {
      userPayload.lawyerProfile = {
        barLicenseNumber: String(barLicenseNumber).trim(),
        yearsOfExperience: Number(yearsOfExperience),
        specialization,
        officeLocation: String(officeLocation).trim(),
        bio: String(bio).trim(),
      };
    }

    const user = await User.create(userPayload);

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    console.error('Register error:', error);
    return res.status(500).json({ message: 'Unable to register user right now' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to login right now' });
  }
};
