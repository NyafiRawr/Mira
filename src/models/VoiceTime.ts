import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class VoiceTime extends Model {
  public serverId!: string;
  public userId!: string;
  public entryTime!: number;
}

VoiceTime.init(
  {
    serverId: {
      type: STRING,
      unique: 'voicetimeId',
      allowNull: false,
    },
    userId: {
      type: STRING,
      unique: 'voicetimeId',
      allowNull: false,
    },
    entryTime: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: 'voicetime',
    sequelize,
  }
);

VoiceTime.sync({ alter, force });
