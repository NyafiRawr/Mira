import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class Shop extends Model {
  public serverId!: string;
  public roleId!: string;
  public cost!: number;
}

Shop.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    roleId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    cost: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    modelName: 'shop',
    sequelize,
  }
);

Shop.sync();