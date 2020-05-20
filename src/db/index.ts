import { Sequelize } from 'sequelize';
import config from '../config';
import { initChartData, ChartData } from './model/chartData';
import { initLog, Log } from './model/log';
import { initUser, User } from './model/user';

export { User, Log, ChartData };

export const sequelize = new Sequelize(
  config.dbName,
  config.dbUser,
  config.dbPassword,
  {
    host: config.dbHost,
    dialect: 'mysql',
    logging: false,
  }
);

initChartData(sequelize);
initLog(sequelize);
initUser(sequelize);
