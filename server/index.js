const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet());

// CORS configuration (allow specific origins in production, allow all in dev for now)
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL || 'https://your-production-url.com'] 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting (max 200 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json());

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('TaskForge API is running (Production Ready)');
});

// Global Error Handler (prevents leaking stack traces or raw DB errors to the client)
app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  
  // Don't leak DB specifics to the user in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(err.status || 500).json({ error: message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
