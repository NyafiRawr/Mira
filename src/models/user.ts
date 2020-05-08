import { Model, STRING, DATE, DATEONLY, INTEGER, DOUBLE, NOW } from 'sequelize';
import { sequelize } from '../db';

class User extends Model {
  public id!: number;
  public serverId!: string;
  public firstEntry!: Date;
  public birthday!: Date | null;
  public balance!: number;
  public weight!: number;
  public reputation!: number;
  public voiceTime!: number;
  public coupleId!: string | null;
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
      defaultValue: 0.0,
    },
    reputation: {
      type: INTEGER,
      defaultValue: 0,
    },
    voiceTime: {
      type: INTEGER,
      defaultValue: 0,
    },
    coupleId: {
      type: STRING,
      allowNull: true,
      defaultValue: null
    },
  },
  {
    modelName: 'user',
    sequelize,
  }
);

export default User;

User.sync();
