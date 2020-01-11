import { Model, STRING, DATE, DATEONLY, INTEGER, DOUBLE, NOW } from 'sequelize';
import { sequelize } from '../utils/db';

class User extends Model {
  public id!: number;
  public serverId!: string;
  public firstEntry!: Date;
  public birthday!: Date | null;
  public balance!: number;
  public weight!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    firstEntry: {
      type: DATE,
      defaultValue: NOW,
    },
    birthday: {
      type: DATEONLY,
      allowNull: true,
    },
    balance: {
      type: INTEGER,
      defaultValue: 0,
    },
    weight: {
      type: DOUBLE,
      defaultValue: 0,
    },
  },
  {
    modelName: 'user',
    sequelize,
  }
);

export default User;

User.sync();
