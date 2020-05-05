import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class ReactionRole extends Model {
  public serverId!: string;
  public channelId!: string;
  public messageId!: string;
  public emoji!: string;
  public roleId!: string;
}

ReactionRole.init(
  {
    serverId: STRING,
    channelId: STRING,
    messageId: STRING,
    // Для серверных: ID, а для стандартных: эмодзи в юникоде
    emoji: STRING,
    roleId: STRING,
  },
  {
    modelName: 'reactionrole',
    sequelize,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
);

export default ReactionRole;

ReactionRole.sync();
