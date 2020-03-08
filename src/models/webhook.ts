import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Webhook extends Model {
  public serverId!: string;
  public id!: string;
  public token!: number;
}

Webhook.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    id: {
      type: STRING,
      primaryKey: true,
    },
    token: {
      type: STRING,
    },
  },
  {
    modelName: 'webhook',
    sequelize,
  }
);

export default Webhook;

Webhook.sync();
