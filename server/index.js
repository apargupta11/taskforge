const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('TaskForge API is running (Modular)');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
