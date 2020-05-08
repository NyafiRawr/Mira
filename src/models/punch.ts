import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class Punch extends Model {
  public serverId!: string;
  public countWarns!: number;
  public termDays!: number; // В течение скольки дней нужно получить countWarns
  public timeMuteMs!: number;
}

Punch.init(
  {
    serverId: STRING,
    countWarns: INTEGER,
    termDays: INTEGER,
    timeMuteMs: INTEGER
  },
  {
    modelName: 'punch',
    sequelize
  }
);

export default Punch;

Punch.sync();
