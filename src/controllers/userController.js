import userService from '../services/userService.js';

/**
 * Controller to handle user-related requests.
 */

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.registerUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Logs in an existing user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const loginUser = async (req, res) => {
  try {
    const loginData = req.body;
    const user = await userService.loginUser(loginData);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export { registerUser, loginUser };