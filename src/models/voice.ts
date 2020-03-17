import { Model, STRING, NUMBER } from 'sequelize';
import { sequelize } from '../db';

class Voice extends Model {
  public serverId!: string;
  public categoryId!: string;
  public price!: number;
}

Voice.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    categoryId: STRING,
    price: NUMBER,
  },
  {
    modelName: 'voice',
    sequelize,
  }
);

export default Voice;

Voice.sync();
