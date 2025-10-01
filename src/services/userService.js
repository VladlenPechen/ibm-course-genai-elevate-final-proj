import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../config/auth.js';

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
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
};

/**
 * Logs in an existing user.
 * @param {Object} loginData - The login data containing email and password.
 * @returns {Promise<Object>} - The logged-in user data and token.
 */
const loginUser = async (loginData) => {
  const { email, password } = loginData;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  }
  throw new Error('Invalid email or password');
};

export default { registerUser, loginUser };