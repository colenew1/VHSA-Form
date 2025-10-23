const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Import your route handlers
const studentsRoutes = require('./routes/students');
const screeningsRoutes = require('./routes/screenings');
const schoolsRoutes = require('./routes/schools');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase available to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routes
app.use('/api/students', studentsRoutes);
app.use('/api/screenings', screeningsRoutes);
app.use('/api/schools', schoolsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VHSA Form API is running' });
});

// Netlify function handler
exports.handler = async (event, context) => {
  // Create a mock request/response for Express
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body
  };

  const response = {
    statusCode: 200,
    headers: {},
    body: ''
  };

  // Handle the request
  return new Promise((resolve) => {
    const res = {
      status: (code) => {
        response.statusCode = code;
        return res;
      },
      json: (data) => {
        response.headers['Content-Type'] = 'application/json';
        response.body = JSON.stringify(data);
        resolve(response);
      },
      send: (data) => {
        response.body = data;
        resolve(response);
      },
      header: (name, value) => {
        response.headers[name] = value;
        return res;
      }
    };

    app(request, res);
  });
};
