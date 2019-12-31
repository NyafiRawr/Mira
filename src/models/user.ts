import { Model, STRING, DATE, DATEONLY, INTEGER, DOUBLE, NOW } from 'sequelize';
import { sequelize } from '../modules/db';

class User extends Model {}
User.init({
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
}, {
  modelName: 'user',
  sequelize,
});

export default User;

User.sync();
