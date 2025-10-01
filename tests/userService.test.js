import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerUser, loginUser, getUserById } from '../src/services/userService.js';
import User from '../src/models/userModel.js';
import { generateToken } from '../src/config/auth.js';

// Mock dependencies
vi.mock('../src/models/userModel.js');
vi.mock('../src/config/auth.js');
vi.mock('../src/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mock-jwt-token');

      const result = await registerUser(userData);

      expect(result).toEqual({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        token: 'mock-jwt-token'
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      await expect(registerUser(userData)).rejects.toThrow('User already exists');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = {
        email: { message: 'Invalid email format' }
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(validationError);

      await expect(registerUser(userData)).rejects.toThrow('Validation failed');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        isLocked: false,
        comparePassword: vi.fn().mockResolvedValue(true),
        resetLoginAttempts: vi.fn().mockResolvedValue(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      User.findByEmail.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mock-jwt-token');

      const result = await loginUser(loginData);

      expect(result).toEqual({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        token: 'mock-jwt-token'
      });

      expect(User.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('Password123!');
      expect(mockUser.resetLoginAttempts).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      User.findByEmail.mockResolvedValue(null);

      await expect(loginUser(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for locked account', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        isLocked: true
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(loginUser(loginData)).rejects.toThrow('Account is temporarily locked');
    });

    it('should handle invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        isLocked: false,
        comparePassword: vi.fn().mockResolvedValue(false),
        incLoginAttempts: vi.fn().mockResolvedValue()
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(loginUser(loginData)).rejects.toThrow('Invalid email or password');
      expect(mockUser.incLoginAttempts).toHaveBeenCalled();
    });

    it('should require email and password', async () => {
      await expect(loginUser({})).rejects.toThrow('Email and password are required');
      await expect(loginUser({ email: 'test@example.com' })).rejects.toThrow('Email and password are required');
      await expect(loginUser({ password: 'password' })).rejects.toThrow('Email and password are required');
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await getUserById(userId);

      expect(result).toEqual({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });

      expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error for non-existent user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      User.findById.mockResolvedValue(null);

      await expect(getUserById(userId)).rejects.toThrow('User not found');
    });

    it('should throw error for inactive user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: false
      };

      User.findById.mockResolvedValue(mockUser);

      await expect(getUserById(userId)).rejects.toThrow('User not found');
    });
  });
});