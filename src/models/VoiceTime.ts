import { Model, STRING } from 'sequelize';
import { sequelize } from '../database';

export default class VoiceTime extends Model {
  public serverId!: string;
  public userId!: string;
  public entryTime!: string;
}

VoiceTime.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    entryTime: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'voicetime',
    sequelize,
  }
);

VoiceTime.sync({ force: false });
