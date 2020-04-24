import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class GuildMember extends Model {
  public serverId!: string;
  public userId!: string;
  public guildId!: string;
}

GuildMember.init(
  {
    serverId: STRING,
    userId: STRING,
    guildId: STRING
  },
  {
    modelName: 'guildmember',
    sequelize,
  }
);

export default GuildMember;

GuildMember.sync();
