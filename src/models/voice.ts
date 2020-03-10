import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Voice extends Model {
  public serverId!: string;
  public categoryId!: string;
  public price!: string;
}

Voice.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    categoryId: STRING,
    price: STRING,
  },
  {
    modelName: 'voice',
    sequelize,
  }
);

export default Voice;

Voice.sync();
