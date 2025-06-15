import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
if (process.env.CLIENT_ORIGIN) {
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

// PERFORMANCE OPTIMIZATIONS: Apply compression and CORS before other middleware
app.use(compression({
  // Compress all responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (1-9, 6 is default, 1 is fastest)
  level: 6,
  // Only compress responses larger than 1KB
  threshold: 1024
}));

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Other middleware with performance optimizations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request timing middleware for performance monitoring
app.use((req, res, next) => {
  req.startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Routes with /api prefix
app.use('/api/blog', blogRoutes);

// Health check endpoint with performance info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    environment: process.env.NODE_ENV || 'development',
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Qinyu Blog API Server - Performance Optimized',
    version: '2.0.0',
    endpoints: [
      '/health',
      '/api/blog/posts - Get all posts',
      '/api/blog/posts/metadata - Get posts metadata only (fast)',
      '/api/blog/posts/:id - Get specific post',
      '/api/blog/posts/category/:category - Get posts by category', 
      '/api/blog/categories - Get all categories',
      '/api/blog/cache/stats - Get cache statistics',
      '/api/blog/cache/clear - Clear all caches (POST)'
    ],
    performance: {
      features: [
        'Multi-tier caching system',
        'Concurrent content processing',
        'Gzip compression',
        'Request timing',
        'Metadata-first loading'
      ]
    }
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

// Start server with performance logging
const server = app.listen(port, () => {
  console.log('🚀 ===========================================');
  console.log(`🚀 Qinyu Blog API Server v2.0 - PERFORMANCE OPTIMIZED`);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ===========================================');
  console.log('⚡ Performance Features Enabled:');
  console.log('   • Multi-tier caching (30min/1hr/2hr)');
  console.log('   • Gzip compression');
  console.log('   • Concurrent processing');
  console.log('   • Request timing monitoring');
  console.log('   • Metadata-first loading');
  console.log('🚀 ===========================================');
});

export default app;
