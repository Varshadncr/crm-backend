const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Customer = require('../models/Customer');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }

    // Create the customer record
    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      userId: req.user.id, // Associate the customer with the logged-in user
    });

    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all customers for the logged-in user with optional search, filtering, and pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, company, page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build the query options
    const queryOptions = {
      where: {
        userId: req.user.id, // Ensure only customers of the logged-in user are fetched
      },
      offset: (pageNumber - 1) * limitNumber, // Calculate the offset for pagination
      limit: limitNumber, // Limit the number of customers per page
    };

    // Add search functionality for name, email, or phone
    if (search) {
      queryOptions.where[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.like]: `%${search}%` } },
        { email: { [Sequelize.Op.like]: `%${search}%` } },
        { phone: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    // Add filtering by company
    if (company) {
      queryOptions.where.company = { [Sequelize.Op.like]: `%${company}%` };
    }

    // Fetch the customers based on the search, filtering, and pagination criteria
    const customers = await Customer.findAll(queryOptions);

    // Get the total count of customers for pagination metadata
    const totalCustomers = await Customer.count({ where: { userId: req.user.id } });

    res.json({
      customers,
      totalPages: Math.ceil(totalCustomers / limitNumber), // Total pages based on the limit
      currentPage: pageNumber,
      totalCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get a single customer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a customer by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update customer details
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.company = company || customer.company;

    await customer.save();

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a customer by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.destroy();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
