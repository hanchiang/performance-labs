import fs from 'fs';
import { promisify } from 'util';

import { User } from '../db';
const USERS_FILE = 'seed.json';

const readFileAsync = promisify(fs.readFile).bind(fs);

// to run: npm run build && node dist/seed/seed.js

const createUsers = async () => {
  const users = await readFileAsync(USERS_FILE, { encoding: 'utf-8' });
  await User.bulkCreate(JSON.parse(users));
};

createUsers();
