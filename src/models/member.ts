import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Member extends Model {
  public idGuild!: string;
  public idUser!: string;
}

Member.init(
  {
    idGuild: STRING,
    idUser: STRING
  },
  {
    modelName: 'member',
    sequelize,
  }
);

export default Member;

Member.sync();
