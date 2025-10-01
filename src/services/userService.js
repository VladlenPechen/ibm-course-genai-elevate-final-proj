import User from '../models/userModel.js';
import { generateToken } from '../config/auth.js';
import { createUserResponse } from '../utils/userResponse.js';
import logger from '../utils/logger.js';

/**
 * Service to handle user-related operations.
 */

/**
 * Registers a new user.
 * @param {Object} userData - The user data for registration.
 * @returns {Promise<Object>} - The registered user data and token.
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    logger.warn(`Registration attempt with existing email: ${email}`);
    throw new Error('User already exists with this email address');
  }

  try {
    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password 
    });

    // Generate token
    const token = generateToken(user._id);
    
    logger.info(`New user registered: ${user.email}`, { userId: user._id });
    
    return createUserResponse(user, token);
  } catch (error) {
    logger.error(`User registration failed: ${error.message}`, { email });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      throw new Error('User already exists with this email address');
    }
    
    throw new Error('Registration failed. Please try again.');
  }
};

/**
 * Logs in an existing user.
 * @param {Object} loginData - The login data containing email and password.
 * @returns {Promise<Object>} - The logged-in user data and token.
 */
const loginUser = async (loginData) => {
  const { email, password } = loginData;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Find user by email (includes password field)
    const user = await User.findByEmail(email);
    
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      logger.warn(`Login attempt on locked account: ${email}`);
      throw new Error('Account is temporarily locked due to too many failed login attempts. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      await user.incLoginAttempts();
      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Generate token
    const token = generateToken(user._id);
    
    logger.info(`User logged in successfully: ${user.email}`, { userId: user._id });
    
    return createUserResponse(user, token);
  } catch (error) {
    // Don't log the full error for security reasons, just the message
    logger.error(`Login failed for email ${email}: ${error.message}`);
    throw error;
  }
};

/**
 * Gets user by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The user data
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }
    return createUserResponse(user);
  } catch (error) {
    logger.error(`Failed to get user by ID ${userId}: ${error.message}`);
    throw new Error('User not found');
  }
};

/**
 * Updates user profile
 * @param {string} userId - The user ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - The updated user data
 */
const updateUserProfile = async (userId, updateData) => {
  try {
    const { name, email } = updateData;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new Error('Email is already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase() })
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User profile updated: ${user.email}`, { userId });
    return createUserResponse(user);
  } catch (error) {
    logger.error(`Failed to update user profile ${userId}: ${error.message}`);
    throw error;
  }
};

export { registerUser, loginUser, getUserById, updateUserProfile };