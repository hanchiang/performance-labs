import moment from 'moment-timezone';

import config from '../config';

export const parseDateAndKeepOffset = (
  date: string,
  format: string = config.dateInputFormat,
  isStrict: boolean = true
) => moment.parseZone(date, format, isStrict);
