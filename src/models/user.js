import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';

class User extends Model {}
User.init({
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  serverId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  firstEntry: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  birthday: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  balance: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
}, {
  modelName: 'user',
  sequelize,
});

export default User;
