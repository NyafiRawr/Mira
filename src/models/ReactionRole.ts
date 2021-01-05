import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize } from '../database';

export default class ReactionRole extends Model {
  public id: number;
  public serverId!: string;
  public channelId!: string;
  public messageId!: string;
  public roleId!: string;
  public reaction!: string;
}

ReactionRole.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serverId: STRING,
    channelId: STRING,
    messageId: STRING,
    roleId: STRING,
    reaction: STRING,
  },
  {
    modelName: 'reaction_role',
    sequelize,
  }
);

ReactionRole.sync({ force: false });
