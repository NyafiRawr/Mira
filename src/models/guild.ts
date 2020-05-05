import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class Guild extends Model {
  public serverId!: string;
  public id!: string;
  public name!: string;
  public description!: string;
  public ownerId!: string;
  public chatId!: string;
  public voiceId!: string;
}

Guild.init(
  {
    serverId: STRING,
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: STRING,
    description: STRING,
    ownerId: STRING,
    chatId: STRING,
    voiceId: STRING,
  },
  {
    modelName: 'guild',
    sequelize,
  }
);

export default Guild;

Guild.sync();
