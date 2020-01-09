import { Model, STRING } from 'sequelize';
import { sequelize } from '../modules/db';

class Emoji extends Model {}
Emoji.init(
  {
    channelId: {
      type: STRING,
      primaryKey: true,
    },
    messageId: {
      type: STRING,
      primaryKey: true,
    },
    emojiId: {
      type: STRING,
      primaryKey: true,
    },
    roleId: {
      type: STRING,
      primaryKey: true,
    },
  },
  {
    modelName: 'emoji',
    sequelize,
  }
);

export default Emoji;

Emoji.sync();
