import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to create JWT token
const createToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Validation helper
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// ============ CLIENT REGISTRATION ============
router.post('/register/client', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide fullName, email, and password',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      passwordHash: password,
      role: 'client',
      phone,
    });

    await newUser.save();

    // Create token
    const token = createToken(newUser._id, newUser.role);

    res.status(201).json({
      message: 'Client registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============ LAWYER REGISTRATION ============
router.post('/register/lawyer', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      barId,
      practiceAreas,
      yearsExperience,
    } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide fullName, email, and password',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new lawyer user
    const newLawyer = new User({
      fullName,
      email,
      passwordHash: password,
      role: 'lawyer',
      phone,
      barId,
      practiceAreas: practiceAreas || [],
      yearsExperience: yearsExperience || 0,
      isApproved: false, // Will be approved by admin later
    });

    await newLawyer.save();

    // Create token
    const token = createToken(newLawyer._id, newLawyer.role);

    res.status(201).json({
      message: 'Lawyer registered successfully. Awaiting admin approval.',
      user: {
        id: newLawyer._id,
        fullName: newLawyer.fullName,
        email: newLawyer.email,
        role: newLawyer.role,
        isApproved: newLawyer.isApproved,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = createToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============ GET CURRENT USER ============
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        barId: user.barId,
        practiceAreas: user.practiceAreas,
        yearsExperience: user.yearsExperience,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ ADMIN ROUTES ============

// Get all users (admin only)
router.get('/admin/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve lawyer (admin only)
router.patch('/admin/approve-lawyer/:lawyerId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    lawyer.isApproved = true;
    await lawyer.save();

    res.json({
      message: 'Lawyer approved successfully',
      lawyer: {
        id: lawyer._id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        isApproved: lawyer.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all approved lawyers
router.get('/lawyers', async (req, res) => {
  try {
    const lawyers = await User.find({
      role: 'lawyer',
      isApproved: true,
    }).select('-passwordHash');

    res.json({
      count: lawyers.length,
      lawyers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
