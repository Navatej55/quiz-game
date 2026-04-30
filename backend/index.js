const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultsRoutes = require('./routes/resultsRoutes');

const app = express();

// Middleware
app.use(cors()); // Allow all origins for production testing
app.use(express.json());

// =========================================================
// MongoDB Connection Setup (Debug Mode)
// =========================================================

// 3. Forcefully clear any previous/cached connections to avoid stale states
mongoose.disconnect();

const uri = process.env.MONGO_URI;

// Sanitize the URI for logging (hides the password)
const sanitizedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED';

// 1. & 2. Complete minimal connection setup using ONE connection
mongoose.connect(uri)
  .then(async (conn) => {
    console.log(`\n==============================================`);
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`🔗 Sanitized URI: ${sanitizedUri}`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`==============================================\n`);

    // 5. Test Insert (insertOne equivalent using Mongoose)
    try {
      // Define a simple schema for the test
      const testSchema = new mongoose.Schema({
        message: String,
        clusterHost: String,
        timestamp: { type: Date, default: Date.now }
      });
      
      // Ensure we don't overwrite/recompile the model if nodemon reloads
      const TestModel = mongoose.models.TestConnection || mongoose.model('TestConnection', testSchema);
      
      const testDoc = await TestModel.create({
        message: "Confirming database connection!",
        clusterHost: conn.connection.host
      });
      
      console.log(`📝 TEST INSERT SUCCESSFUL:`);
      console.log(`   Document ID: ${testDoc._id}`);
      console.log(`👉 Action Required: Open MongoDB Atlas, go to the '${conn.connection.name}' database, and look for the 'testconnections' collection to verify this insert.`);
      console.log(`\n==============================================\n`);
    } catch (testErr) {
      console.error('❌ Failed to insert test document:', testErr);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit if connection fails
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Quiz Battle API is running!' });
});

// Global error handler — MUST be after all routes
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Catch uncaught exceptions so the process doesn't crash silently
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});