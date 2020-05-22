import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model {
  public readonly id!: string;
  public readonly utcOffset!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  toJson() {
    return this.get({ plain: true });
  }
}

const userSchema = {
  id: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  utcOffset: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
};

export const initUser = (sequelize: Sequelize) => {
  User.init(userSchema, {
    sequelize,
    tableName: 'user',
    underscored: true,
  });
};
