import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../modules/db';

class Shop extends Model { }
Shop.init({
  roleId: {
    type: STRING,
    primaryKey: true,
  },
  serverId: {
    type: STRING,
    primaryKey: true,
  },
  cost: {
    type: INTEGER,
    defaultValue: 0,
  },
}, {
  modelName: 'shop',
  sequelize,
});

export default Shop;

Shop.sync();
