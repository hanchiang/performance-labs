import express, { Request, Response } from 'express';

import * as middlewares from '../middleware';
import * as controller from '../controller';
import * as validators from '../validator';

const router = express.Router();

router.get(
  '/',
  middlewares.catchErrors(async (req: Request, res: Response) => {
    res.json('Service is up and running!');
  })
);

router.post(
  '/logs',
  validators.validateAddLogs,
  middlewares.catchErrors(controller.addLog)
);

router.get('/logs/:userId', middlewares.catchErrors(controller.getLogsForUser));

export default router;
