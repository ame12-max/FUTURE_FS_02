const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const noteRoutes = require('./routes/noteRoutes');
const db = require('./config/db'); // import database connection

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);

// Test database connection before starting server
const startServer = async () => {
  try {
    // Try a simple query to check DB connectivity
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // exit if DB is unreachable
  }
};

startServer();