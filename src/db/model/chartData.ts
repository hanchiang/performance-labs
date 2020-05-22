import { DataTypes, Model, Sequelize } from 'sequelize';

export class Chart extends Model {
  public readonly id!: number;
  public readonly logId!: number;
  public readonly value!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON() {
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
    },
  },
  value: {
    type: DataTypes.SMALLINT,
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
