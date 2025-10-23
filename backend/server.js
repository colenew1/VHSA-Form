require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const studentsRoutes = require('./routes/students');
const screeningsRoutes = require('./routes/screenings');
const schoolsRoutes = require('./routes/schools');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/students', studentsRoutes);
app.use('/api/screenings', screeningsRoutes);
app.use('/api/schools', schoolsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VHSA Form Backend API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      screenings: '/api/screenings',
      schools: '/api/schools',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.code === 'ENOTFOUND') {
    return res.status(503).json({ error: 'Database connection failed' });
  }
  
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Foreign key constraint violation' });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VHSA Form Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  
  // Validate environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Warning: Supabase environment variables not set');
    console.warn('   Please check your .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
