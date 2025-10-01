import jwt from 'jsonwebtoken';
import config from './config.js';

/**
 * Generates a JWT token for user authentication
 * @param {string} id - User ID
 * @param {Object} options - Additional options for token generation
 * @returns {string} - JWT token
 */
const generateToken = (id, options = {}) => {
  const payload = { 
    id,
    iat: Math.floor(Date.now() / 1000),
    type: 'access'
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || config.jwtExpire,
    issuer: 'user-management-service',
    audience: 'user-management-client'
  };

  return jwt.sign(payload, config.jwtSecret, tokenOptions);
};

/**
 * Verifies a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: 'user-management-service',
      audience: 'user-management-client'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generates a refresh token with longer expiration
 * @param {string} id - User ID
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (id) => {
  const payload = { 
    id,
    iat: Math.floor(Date.now() / 1000),
    type: 'refresh'
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d', // Refresh tokens expire in 7 days
    issuer: 'user-management-service',
    audience: 'user-management-client'
  });
};

export { generateToken, verifyToken, generateRefreshToken };