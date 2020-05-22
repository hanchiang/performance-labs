import { Sequelize, DataTypes, Model } from 'sequelize';

export class Log extends Model {
  public readonly id!: number;
  public readonly userId!: string;
  public readonly dateTime: Date;
  public readonly value!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
