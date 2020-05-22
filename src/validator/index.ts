import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';

import config from '../config';
import { AddLogRequest } from '../type/request';
import { throwError, ErrorCode } from '../util/error';

export const validateAddLogs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, datetime, value }: AddLogRequest = req.body;

  if (userId === undefined) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: 'User id is required',
    });
  }
  if (typeof userId !== 'string') {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: 'User id must be a string',
    });
  }

  if (datetime === undefined) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: 'Date is required',
    });
  }

  const datetimeMoment = moment.parseZone(
    datetime,
    config.dateInputFormat,
    true
  );
  if (!datetimeMoment.isValid()) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: 'Date is invalid',
    });
  }

  if (value === undefined) {
    if (typeof value !== 'number') {
      throwError({
        status: ErrorCode.BAD_REQUEST,
        message: 'Value is required',
      });
    }
  }

  if (typeof value !== 'number') {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: 'Value must be a number',
    });
  }
  next();
};
