// models/Customer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// Define the Customer model
const Customer = sequelize.define('Customer', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Associate the customer with a user
Customer.belongsTo(User, { foreignKey: 'userId' });

module.exports = Customer;
