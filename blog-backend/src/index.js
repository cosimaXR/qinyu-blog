import express from 'express';
import cors from 'cors';
import { blogRoutes } from './routes/blog.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration - Support multiple origins
const allowedOrigins = [
  'https://www.qinyu.blog',
  'https://qinyu.blog',
  'https://qinyu-blog.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  process.env.CLIENT_ORIGIN // Environment variable fallback
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials if needed
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes - Add /api prefix to match frontend expectations
app.use('/api/blog', blogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Qinyu Blog API Server',
    endpoints: [
      '/api/blog/posts',
      '/api/blog/posts/:id',
      '/api/blog/posts/category/:category',
      '/api/blog/categories'
    ]
  });
});

// Export the app for Vercel
export default app;