import moment from 'moment-timezone';
import { expect } from 'chai';
import { Server } from 'http';
import request from 'supertest';

import app from '../../src/app';
import configTest from '../config';
import config from '../../src/config';
import { User, sequelize, Chart, Log } from '../../src/db';

const seed = require('../../seed.json');

let server: Server;

describe('Integration test', () => {
  beforeEach(async () => {
    return new Promise((resolve) => {
      server = app.listen(configTest.port, resolve);
    });
  });

  afterEach(async () => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  after(async () => sequelize.close());

  describe('Add log', () => {
    const reqBody = {
      userId: seed[0].id,
      date: '2020-01-01 01:00:00 +0700',
      value: 10,
    };

    describe('Validation error', () => {
      it('invalid userId', async () => {
        // userId is missing
        let res = await request(server).post('/logs').send({
          date: reqBody.date,
          value: reqBody.value,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'user id is required'
        );

        // userId is not a string
        res = await request(server).post('/logs').send({
          userId: true,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'user id must be a string'
        );

        res = await request(server).post('/logs').send({
          userId: 1,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'user id must be a string'
        );

        res = await request(server).post('/logs').send({
          userId: [],
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'user id must be a string'
        );

        res = await request(server).post('/logs').send({
          userId: {},
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'user id must be a string'
        );
      });

      it('invalid date', async () => {
        // missing date
        let res = await request(server).post('/logs').send({
          userId: reqBody.userId,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'date is required'
        );

        // invalid date
        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: '2020-01-0101:00:00 +0000',
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'date is invalid'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: '2020-13-01 01:00:00 +0000',
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'date is invalid'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: '2020-12-01 01:00 +0000',
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'date is invalid'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: '2020-12-01 24:00:01 +0000',
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'date is invalid'
        );
      });

      it('invalid value', async () => {
        // missing value
        let res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: reqBody.date,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'value is required'
        );

        // value is not a number
        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: reqBody.date,
          value: '1',
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'value must be a number'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: reqBody.date,
          value: true,
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'value must be a number'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: reqBody.date,
          value: {},
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'value must be a number'
        );

        res = await request(server).post('/logs').send({
          userId: reqBody.userId,
          datetime: reqBody.date,
          value: [],
        });
        expect(res.status).to.equal(400);
        expect(res.body.error.message.toLowerCase()).to.equal(
          'value must be a number'
        );
      });
    });

    describe('Route logic', () => {
      beforeEach(async () => {
        await User.bulkCreate(seed);
      });

      afterEach(async () => {
        await User.destroy({
          where: {},
        });
      });

      describe('Add log: run time error', () => {
        it('user id is not found in database', async () => {
          const res = await request(server).post('/logs').send({
            userId: '1',
            datetime: '2020-01-01 01:00:00 +0700',
            value: 10,
          });
          expect(res.status).to.equal(400);
          expect(res.body.error.message.toLowerCase()).to.equal(
            `user 1 is not found`
          );
        });

        it('log utc offset does not match user utc offset', async () => {
          const res = await request(server).post('/logs').send({
            userId: seed[0].id,
            datetime: `2020-01-01 01:00:00 +0601`,
            value: 10,
          });
          expect(res.status).to.equal(400);
          expect(res.body.error.message.toLowerCase()).to.equal(
            `log utc offset does not match user utc offset`
          );
        });

        it('date must not be later than current date', async () => {
          const utcOffset = seed[0].utcOffset;
          const now = moment().utcOffset(utcOffset);

          const later = now.add(1, 'minute').format(config.dateInputFormat);

          const res = await request(server).post('/logs').send({
            userId: seed[0].id,
            datetime: later,
            value: 10,
          });
          expect(res.status).to.equal(400);
          expect(res.body.error.message.toLowerCase()).to.equal(
            `date must not be later than current date`
          );
        });
      });

      describe('Add log: Successful requests', () => {
        const user = seed[0];
        it('should add log and chart, and get the expected chart value from database', async () => {
          // day -1, hour 0, log value 10, expect chart value 0
          let datetime = moment()
            .subtract(1, 'day')
            .utcOffset(user.utcOffset)
            .startOf('day');
          let res = await request(server)
            .post('/logs')
            .send({
              userId: user.id,
              datetime: datetime.format(config.dateInputFormat),
              value: 10,
            });
          expect(res.status).to.equal(200);
          let chart = await Chart.findOne({
            where: { id: res.body.chart },
          });
          expect(chart.value).to.equal(0);

          // day - 1, hour 5, log value 10, expect chart value 45
          datetime = moment()
            .subtract(1, 'day')
            .utcOffset(user.utcOffset)
            .startOf('day')
            .add(5, 'hour');
          res = await request(server)
            .post('/logs')
            .send({
              userId: user.id,
              datetime: datetime.format(config.dateInputFormat),
              value: 10,
            });
          chart = await Chart.findOne({
            where: { id: res.body.chart },
          });
          expect(chart.value).to.equal(45);

          // day -1, hour 11, log value 8, expect chart value 100
          datetime = moment()
            .subtract(1, 'day')
            .utcOffset(user.utcOffset)
            .startOf('day')
            .add(11, 'hour');
          res = await request(server)
            .post('/logs')
            .send({
              userId: user.id,
              datetime: datetime.format(config.dateInputFormat),
              value: 8,
            });
          chart = await Chart.findOne({
            where: { id: res.body.chart },
          });
          expect(chart.value).to.equal(100);

          // day -2, hour 2, log value 10, expect chart value 15
          datetime = moment()
            .subtract(2, 'day')
            .utcOffset(user.utcOffset)
            .startOf('day')
            .add(2, 'hour');
          res = await request(server)
            .post('/logs')
            .send({
              userId: user.id,
              datetime: datetime.format(config.dateInputFormat),
              value: 10,
            });
          chart = await Chart.findOne({
            where: { id: res.body.chart },
          });
          expect(chart.value).to.equal(15);
        });
      });
    });
  });

  describe.only('Get user logs', () => {
    describe('Route logics', () => {
      beforeEach(async () => {
        await User.bulkCreate(seed);
      });

      afterEach(async () => {
        await User.destroy({
          where: {},
        });
      });

      describe('Run time error', () => {
        it('user id is not found in database', async () => {
          const res = await request(server).post('/logs').send({
            userId: '1',
            datetime: '2020-01-01 01:00:00 +0700',
            value: 10,
          });
          expect(res.status).to.equal(400);
          expect(res.body.error.message.toLowerCase()).to.equal(
            `user 1 is not found`
          );
        });

        it('should get the logs for user', async () => {
          // add logs for user 1
          const logsUser1 = [
            {
              userId: seed[0].id,
              datetime: '2020-01-01 01:00:00 -0600',
              value: 10,
            },
            {
              userId: seed[0].id,
              datetime: '2020-01-01 05:00:00 -0600',
              value: 20,
            },
          ];
          await request(server).post('/logs').send(logsUser1[0]);
          await request(server).post('/logs').send(logsUser1[1]);

          // add logs for user 2
          const logsUser2 = [
            {
              userId: seed[1].id,
              datetime: '2020-01-01 07:30:00 +0200',
              value: 30,
            },
          ];
          await request(server).post('/logs').send(logsUser2[0]);

          // should get user 1 logs
          const expectedChartValues = [5, 35];
          const resultUser1 = await request(server).get(
            `/logs/${logsUser1[0].userId}`
          );
          expect(resultUser1.status).to.equal(200);
          expect(resultUser1.body.length).to.equal(logsUser1.length);
          for (let i = 0; i < resultUser1.body.length; i++) {
            const logChart = resultUser1.body[i];
            expect(logChart.userId).to.equal(logsUser1[i].userId);
            expect(logChart.datetime).to.equal(logsUser1[i].datetime);
            expect(logChart.value).to.equal(logsUser1[i].value);
            expect(logChart.Chart.logId).to.equal(logChart.id);
            expect(logChart.Chart.value).to.equal(expectedChartValues[i]);
          }

          // should get user 2 logs
          const resultUser2 = await request(server).get(
            `/logs/${logsUser2[0].userId}`
          );
          expect(resultUser2.status).to.equal(200);
          expect(resultUser2.body.length).to.equal(logsUser2.length);
          const logChart = resultUser2.body[0];
          expect(logChart.userId).to.equal(logsUser2[0].userId);
          expect(logChart.datetime).to.equal(logsUser2[0].datetime);
          expect(logChart.value).to.equal(logsUser2[0].value);
          expect(logChart.Chart.logId).to.equal(logChart.id);
          expect(logChart.Chart.value).to.equal(55);
        });
      });
    });
  });
});
