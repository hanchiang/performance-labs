import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model {
  private id!: string;
  private utcOffset!: number;
  private createdAt!: Date;
  private updatedAt!: Date;

  toJSON() {
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
