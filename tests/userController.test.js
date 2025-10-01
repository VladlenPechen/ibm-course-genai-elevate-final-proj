const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/userModel');

describe('User Controller', () => {
  beforeAll(async () => {
    await User.deleteMany(); // Clear the database before tests
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});