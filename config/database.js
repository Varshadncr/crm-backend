// config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Create a new instance of Sequelize connected to SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/crm.sqlite'), // SQLite DB file location
  logging: false, // Disable SQL query logging for cleaner output
});

module.exports = sequelize;
