import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors,
  authLimiter,
  generalLimiter 
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Public routes with authentication rate limiting
router.post('/register', 
  authLimiter,
  validateRegistration, 
  handleValidationErrors, 
  registerUser
);

router.post('/login', 
  authLimiter,
  validateLogin, 
  handleValidationErrors, 
  loginUser
);

// Protected routes (require authentication)
router.get('/profile', protect, getUserProfile);

// Health check route (no rate limiting needed)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'User service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;