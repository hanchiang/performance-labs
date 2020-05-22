import moment from 'moment-timezone';
import { Sequelize, DataTypes, Model } from 'sequelize';

import config from '../../config';

const FIELDS_TO_REMOVE = ['createdAt', 'updatedAt'];

interface ToJson {
  fieldsToRemove?: string[];
  utcOffset?: string;
}

export class Log extends Model {
  public readonly id!: number;
  public readonly userId!: string;
  public readonly datetime: Date;
  public readonly value!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  toJson(obj: ToJson = {}) {
    const { fieldsToRemove = FIELDS_TO_REMOVE, utcOffset } = obj;
    const log: any = this.get({ plain: true });
    fieldsToRemove.forEach((field: string) => {
      delete log[field];
    });

    // transform log date
    if (utcOffset != null) {
      log.datetime = moment(log.datetime)
        .utcOffset(utcOffset)
        .format(config.dateInputFormat);
    }

    delete log.Chart.createdAt;
    delete log.Chart.updatedAt;
    return log;
  }
}

const logSchema = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'User',
    },
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
};

export const initLog = (sequelize: Sequelize) => {
  Log.init(logSchema, {
    sequelize,
    tableName: 'log',
    underscored: true,
  });
};
