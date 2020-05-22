import { expect } from 'chai';
import moment from 'moment-timezone';

import * as services from '../../src/service';
const seed = require('../../seed.json');

import { Log, User, Chart, sequelize } from '../../src/db';

describe('Unit test', () => {
  after(async () => {
    return sequelize.close();
  });

  describe('Time zone tests', () => {
    const datetime = '2020-01-01 01:00:00 +0700';
    const datetimeFormat = 'YYYY-MM-DD HH:mm:ss ZZ';

    it('should parse time zone and preserve offset', () => {
      const dateObj = moment.parseZone(datetime, datetimeFormat);
      const offset = dateObj.utcOffset();
      expect(offset).to.equal(420);
    });

    it('should save date time in UTC format in log table', async () => {
      const user = {
        id: '1',
        utcOffset: 60,
      };
      const log = {
        id: '1',
        userId: user.id,
        datetime,
        value: 10,
      };
      await User.create(user);
      await Log.create(log);

      const logFromDb: any = (
        await Log.findOne({
          where: {
            id: log.id,
          },
        })
      ).toJSON();

      // MySQL stores date time in UTC
      expect(logFromDb.datetime).to.eql(
        moment.utc(datetime, datetimeFormat).toDate()
      );

      await User.destroy({
        where: {
          id: user.id,
        },
      });
    });

    it('should convert the start and end of day to the correct UTC time', async () => {
      const startDay = moment
        .parseZone(datetime, datetimeFormat)
        .startOf('day');

      // expect 00:00:00 +0700
      expect(startDay.utcOffset()).to.equal(420);
      expect(startDay.hour()).to.equal(0);
      expect(startDay.minute()).to.equal(0);
      expect(startDay.second()).to.equal(0);

      // expect previous day 17:00:00 +0000
      const startDayUtc = startDay.utc();
      expect(startDayUtc.month(12));
      expect(startDayUtc.date(31));
      expect(startDayUtc.hour()).to.equal(17);
      expect(startDayUtc.minute()).to.equal(0);
      expect(startDayUtc.second()).to.equal(0);

      const endDay = moment.parseZone(datetime, datetimeFormat).endOf('day');
      // expect 23:59:59
      expect(endDay.utcOffset()).to.equal(420);
      expect(endDay.hour()).to.equal(23);
      expect(endDay.minute()).to.equal(59);
      expect(endDay.second()).to.equal(59);

      // expect 16:59:59 +0000
      const endDayUtc = endDay.utc();
      expect(endDayUtc.hour()).to.equal(16);
      expect(endDayUtc.minute()).to.equal(59);
      expect(endDayUtc.second()).to.equal(59);
    });
  });

  describe('Add chart value tests', async () => {
    it('chart value should be the same as current chart value if log value is 0', async () => {
      const datetime = moment.utc().add(1, 'hour');
      const logValue = 0;
      const currentChartValue = 10;
      const user = await User.create(seed[0]);
      const log = await Log.create({
        userId: user.id,
        datetime,
        value: logValue,
      });
      const requestObj = {
        logId: log.id,
        logValue,
        currentChartValue,
      };

      const chart = await services.addChartValue(requestObj);
      expect(chart.value).to.equal(currentChartValue);

      await Promise.all([
        User.destroy({ where: { id: user.id } }),
        Log.destroy({ where: { id: log.id } }),
        Chart.destroy({ where: { id: chart.id } }),
      ]);
    });

    it('chart value should be 0 if current chart value is less than 0.5 * log value ', async () => {
      const datetime = moment.utc().add(1, 'hour');
      const logValue = 40;
      const currentChartValue = 19;
      const user = await User.create(seed[0]);
      const log = await Log.create({
        userId: user.id,
        datetime,
        value: logValue,
      });
      const requestObj = {
        logId: log.id,
        logValue,
        currentChartValue,
      };

      const chart = await services.addChartValue(requestObj);
      expect(chart.value).to.equal(0);

      await User.destroy({ where: { id: user.id } });
    });

    it('chart value should be 100 if current chart value is more than 100 + 0.5 * log value ', async () => {
      const datetime = moment.utc().add(1, 'hour');
      const logValue = 40;
      const currentChartValue = 121;
      const user = await User.create(seed[0]);
      const log = await Log.create({
        userId: user.id,
        datetime,
        value: logValue,
      });
      const requestObj = {
        logId: log.id,
        logValue,
        currentChartValue,
      };

      const chart = await services.addChartValue(requestObj);
      expect(chart.value).to.equal(100);

      await User.destroy({ where: { id: user.id } });
    });
  });
});
