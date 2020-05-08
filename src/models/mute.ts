import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Mute extends Model {
  public serverId!: string;
  public userId!: string;
  public dateRelease!: string;
  public reason!: string;
}

Mute.init(
  {
    serverId: STRING,
    userId: STRING,
    dateRelease: STRING,
    reason: STRING
  },
  {
    modelName: 'mute',
    sequelize,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
);

export default Mute;

Mute.sync();
