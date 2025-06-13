import express from 'express';
import cors from 'cors';
import { blogRoutes } from './routes/blog.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigin = process.env.CLIENT_ORIGIN;

const corsOptions = {
  origin: allowedOrigin,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/blog', blogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the app for Vercel
export default app; 