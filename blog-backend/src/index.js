import express from 'express';
import cors from 'cors';
import { blogRoutes } from './routes/blog.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enhanced CORS Configuration
const allowedOrigins = [
  'https://www.qinyu.blog',
  'https://qinyu.blog', 
  'https://qinyu-blog.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

// Add environment variable if it exists
if (process.env.CLIENT_ORIGIN ) {
  allowedOrigins.push(process.env.CLIENT_ORIGIN);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origin for debugging
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Return error for blocked origins
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with /api prefix
app.use('/api/blog', blogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Qinyu Blog API Server',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/blog/posts',
      '/api/blog/posts/:id',
      '/api/blog/posts/category/:category', 
      '/api/blog/categories'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

export default app;
