import express, { Request, Response } from 'express';
import * as middlewares from '../middleware';
const router = express.Router();

router.get(
  '/',
  middlewares.catchErrors(async (req: Request, res: Response) => {
    res.json('Service is up and running!');
  })
);

export default router;
