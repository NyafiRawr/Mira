import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class Shop extends Model {
  public serverId!: string;
  public roleId!: string;
  public cost!: number;
}

Shop.init(
  {
    serverId: {
      type: STRING,
    },
    roleId: {
      type: STRING,
    },
    cost: {
      type: INTEGER,
      defaultValue: 0,
    },
  },
  {
    modelName: 'shop',
    sequelize,
  }
);

export default Shop;

Shop.sync();
