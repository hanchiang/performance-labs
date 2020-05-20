import { expect } from 'chai';
import { Server } from 'http';
import request from 'supertest';

import app from '../../src/app';
import config from '../config';

let server: Server;

describe('Integration test', () => {
  beforeEach(async () => {
    return new Promise((resolve) => {
      server = app.listen(config.port, resolve);
    });
  });

  afterEach(async () => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  // Case 1: chart value cannot be lower than 0

  // Case 2: chart value cannot be more than 100

  // Case 3: chart value keeps going up, with log values 0

  // Case 4: chart value drops with positive log values

  // Log utc offset must match user utc offset
});
