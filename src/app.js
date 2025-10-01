import express, { json } from 'express';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';
import PORT from './config/server.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(json()); // Parse JSON request bodies
app.use('/api/users', userRoutes); // User routes
app.use(errorHandler); // Error handling middleware

const port = PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});