import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';

class Shop extends Model { }
Shop.init({
  roleId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  serverId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  cost: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
}, {
  modelName: 'shop',
  sequelize,
});

export default Shop;

Shop.sync();
