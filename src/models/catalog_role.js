import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';


///Кажется это инициализации бдшки

class Roles extends Model {}
Roles.init({
  roleId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  serverId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  roleCost: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
}, {
  modelName: 'roles',
  sequelize,
});

export default Roles;

Roles.sync();
