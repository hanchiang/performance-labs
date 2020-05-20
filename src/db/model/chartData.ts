import { DataTypes, Model, Sequelize } from 'sequelize';

export class ChartData extends Model {
  private id!: number;
  private logId!: number;
  private value!: number;
  private createdAt!: Date;
  private updatedAt!: Date;

  toJSON() {
    return this.get({ plain: true });
  }
}

const chartDataSchema = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  logId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'Log',
      key: 'id',
    },
  },
  value: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
};

export const initChartData = (sequelize: Sequelize) => {
  ChartData.init(chartDataSchema, {
    sequelize,
    tableName: 'log',
    underscored: true,
  });
};
