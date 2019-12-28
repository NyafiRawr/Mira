import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';

class Emoji extends Model { }
Emoji.init({
  channelId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  messageId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  emojiId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  roleId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
}, {
  modelName: 'emoji',
  sequelize,
});

export default Emoji;

Emoji.sync();
