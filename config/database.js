require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'clwy1234',
    database: process.env.DB_NAME || 'education_system_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    timezone: '+08:00'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'clwy1234',
    database: process.env.DB_NAME || 'education_system_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    timezone: '+08:00'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'clwy1234',
    database: process.env.DB_NAME || 'education_system_production',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    timezone: '+08:00'
  }
}; 