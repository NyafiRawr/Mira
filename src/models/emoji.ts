import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../modules/db';

class Emoji extends Model {
  public id!: number;
  public channelId!: string;
  public messageId!: string;
  public emojiId!: string;
  public roleId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Emoji.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
  }
);

export default Emoji;

Emoji.sync();
