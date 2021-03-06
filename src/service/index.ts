import moment from 'moment-timezone';
import { Op } from 'sequelize';

import { Chart, Log, sequelize } from '../db';
import config from '../config';
import { AddChartValue, AddLog } from '../type/service';
import * as dates from '../util/date';
import logger from '../util/logger';

/**
 * Find the current chart value for given user for the day
 * Add a row in Log and Chart table
 */
export const addLog = async (requestObj: AddLog) => {
  const { userId, datetime, value } = requestObj;

  // Convert start and end of day to UTC
  const datetimeMoment = dates.parseDateAndKeepOffset(datetime);
  const startDatetime = datetimeMoment.clone().startOf('day').utc();

  // get the latest chart value for user on that day
  let logChart: any = await Log.findOne({
    where: {
      userId,
      [Op.and]: [
        {
          datetime: {
            [Op.gte]: startDatetime,
          },
        },
        {
          datetime: {
            [Op.lte]: datetimeMoment,
          },
        },
      ],
    },
    include: [{ model: Chart }],
    order: [['datetime', 'DESC']],
    limit: 1,
  });

  let currentChartValue: number;

  if (logChart) {
    logChart = logChart.toJson();
    currentChartValue =
      datetimeMoment.diff(moment(logChart.datetime), 'hour') *
      config.chartIncrementPerHour;
    currentChartValue += logChart.Chart.value;
  } else {
    currentChartValue = datetimeMoment.hour() * config.chartIncrementPerHour;
  }

  const result = await sequelize.transaction(async () => {
    const log = await Log.create(requestObj);
    const chart = await addChartValue({
      logId: log.id,
      logValue: value,
      currentChartValue,
    });
    logger.info(
      `Added log id ${log.id}, log value: ${value}, chart id: ${chart.id}, chart value: ${chart.value}`
    );
    return { log, chart };
  });
  return result;
};

/**
 * Receives log value, current chart value and calculates the chart value to be
 * added to Chart table
 */
export const addChartValue = async (requestObj: AddChartValue) => {
  const { logId, logValue, currentChartValue } = requestObj;
  let chartValue = currentChartValue - (1 / 2) * logValue;
  if (chartValue < config.chartMinValue) {
    chartValue = config.chartMinValue;
  } else if (chartValue > config.chartMaxValue) {
    chartValue = config.chartMaxValue;
  }

  return Chart.create({
    logId,
    value: chartValue,
  });
};

export const getLogChart = async (userId: string, utcOffset: number) => {
  const logCharts: any = await Log.findAll({
    where: {
      userId,
    },
    include: [{ model: Chart }],
  });
  if (logCharts == null) {
    logger.info(`No logs found for user ${userId}`);
    return [];
  }
  return logCharts.map((logChart: any) => logChart.toJson({ utcOffset }));
};
