import moment from 'moment-timezone';
import { Request, Response } from 'express';
import { User } from '../db';

import { throwError, ErrorCode } from '../util/error';
import { AddLogRequest } from '../type/request';
import * as services from '../service';
import * as dates from '../util/date';

export const addLog = async (req: Request, res: Response) => {
  const { userId, datetime, value }: AddLogRequest = req.body;

  const user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (user == null) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: `User ${userId} is not found`,
    });
  }

  // validate datetime
  const datetimeMoment = dates.parseDateAndKeepOffset(datetime);
  // utc offset does not match
  if (user.utcOffset !== datetimeMoment.utcOffset()) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: `Log utc offset does not match user utc offset`,
    });
  }

  // date is past current's day
  if (datetimeMoment.utc().isAfter(moment.utc())) {
    throwError({
      status: ErrorCode.BAD_REQUEST,
      message: `Date must not be later than current date`,
    });
  }
  // all request data is valid! Create a row in Log and Chart table
  const { chart, log } = await services.addLog({
    userId,
    datetime,
    value,
  });

  res.json({
    log: log.id,
    chart: chart.id,
  });
};
