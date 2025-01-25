// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Joi = require('joi');

// Validation schema for user registration
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Validation schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login a user
// routes/auth.js
router.post('/login', async (req, res) => {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });
  
      const { email, password } = req.body;
  
      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Validate the password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' });
  
      // Ensure JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT Secret is not defined' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);  // Log the error for debugging
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
module.exports = router;
