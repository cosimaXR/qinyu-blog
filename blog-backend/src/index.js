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
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN
].filter(Boolean );

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
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

// Root endpoint
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

export default app;
