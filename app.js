require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if the variable is loaded

// app.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const sequelize = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/customers', customerRoutes); // Customer management routes

app.get('/', (req, res) => {
  res.send('CRM Backend API');
});

// Sync the database and start the server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
};

startServer();
