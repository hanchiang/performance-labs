import { DataTypes, Model, Sequelize } from 'sequelize';

const FIELDS_TO_REMOVE = ['createdAt', 'updatedAt'];
export class Chart extends Model {
  public readonly id!: number;
  public readonly logId!: number;
  public readonly value!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJson(fieldsToRemove = FIELDS_TO_REMOVE) {
    const chart: any = this.get({ plain: true });
    fieldsToRemove.forEach((field: string) => {
      delete chart[field];
    });
    return chart;
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
    },
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
};

export const initChartData = (sequelize: Sequelize) => {
  Chart.init(chartDataSchema, {
    sequelize,
    tableName: 'chart_data',
    underscored: true,
  });
};
