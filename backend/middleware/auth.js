import jwt from 'jsonwebtoken';

// Middleware to authenticate user via JWT token
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to authorize user based on roles
export const authorize = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }

    next();
  };
};

// Middleware to ensure user is a client
export const clientOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'This action is for clients only' });
  }

  next();
};

// Middleware to ensure user is a lawyer
export const lawyerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ message: 'This action is for lawyers only' });
  }

  next();
};
