import { registerUser as registerUserService, loginUser as loginUserService } from '../services/userService.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createUserResponse, createSuccessResponse, createErrorResponse } from '../utils/userResponse.js';

/**
 * Controller to handle user-related requests.
 */

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const registerUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const user = await registerUserService(userData);
  
  logger.info(`User registered successfully: ${user.email}`, {
    userId: user._id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(201).json(createSuccessResponse('User registered successfully', user));
});

/**
 * Logs in an existing user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const loginUser = asyncHandler(async (req, res) => {
  const loginData = req.body;
  const user = await loginUserService(loginData);
  
  logger.info(`User logged in successfully: ${user.email}`, {
    userId: user._id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json(createSuccessResponse('Login successful', user));
});

/**
 * Gets the current user profile
 * @param {Object} req - The request object with authenticated user
 * @param {Object} res - The response object
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = createUserResponse(req.user);
  res.json(createSuccessResponse('Profile retrieved successfully', user));
});

export { registerUser, loginUser, getUserProfile };