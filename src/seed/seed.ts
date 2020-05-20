import { v4 as uidv4 } from 'uuid';
import fs from 'fs';

import { User } from '../db';

const utcOffsets: number[] = [-360, 120, 480, 60];
const USERS_FILE = 'seed.json';

// to run: npm run build && node dist/seed/seed.js

const generateUsers = async () => {
  const users: any[] = [];

  for (let i = 0; i < utcOffsets.length; i++) {
    users.push({
      id: uidv4(),
      utcOffset: utcOffsets[i],
    });
  }

  await User.bulkCreate(users);

  return new Promise((resolve, reject) => {
    fs.writeFile(USERS_FILE, JSON.stringify(users, undefined, 2), (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

generateUsers();
