import fs from 'fs';

if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
}
if (process.env.NODE_ENV === 'test' && fs.existsSync('.env.test')) {
  require('dotenv').config({ path: '.env.test' });
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  dbName: process.env.MYSQL_DATABASE,
  dbHost: 'localhost',
  dbUser: process.env.MYSQL_USER,
  dbPassword: process.env.MYSQL_PASSWORD,
};

export default config;
