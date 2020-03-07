import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Emoji extends Model {
  public serverId!: string;
  public channelId!: string;
  public messageId!: string;
  public emojiId!: string;
  public roleId!: string;
}

Emoji.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
    },
    channelId: {
      type: STRING,
      allowNull: false,
    },
    messageId: {
      type: STRING,
      allowNull: false,
    },
    emojiId: {
      type: STRING,
      allowNull: false,
    },
    roleId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'emoji',
    sequelize,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
);

export default Emoji;

Emoji.sync();
