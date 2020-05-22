import { Sequelize } from 'sequelize';
import cls from 'cls-hooked';

import config from '../config';
import { initChartData, Chart } from './model/chartData';
import { initLog, Log } from './model/log';
import { initUser, User } from './model/user';

export { User, Log, Chart };

// Automatically pass transactions to all queries: https://sequelize.org/master/manual/transactions.html
const namespace = cls.createNamespace('analytics-transaction-namespace');
Sequelize.useCLS(namespace);

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

User.hasMany(Log, { foreignKey: 'userId' });
Log.hasOne(Chart, { foreignKey: 'logId' });
