import { Sequelize, DataTypes, Model } from 'sequelize';

export class Log extends Model {
  private id!: number;
  private userId!: string;
  private dateTime: Date;
  private value!: number;
  private createdAt!: Date;
  private updatedAt!: Date;

  toJSON() {
    return this.get({ plain: true });
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
      key: 'id',
    },
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  value: {
    type: DataTypes.SMALLINT,
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
