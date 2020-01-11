import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../modules/db';

class DonateRoles extends Model {
  public id!: number;
  public serverId!: string;
  public roleId!: string;
  public cost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DonateRoles.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    roleId: {
      type: STRING,
    },
    cost: {
      type: INTEGER,
      defaultValue: 0,
    },
  },
  {
    modelName: 'donate_roles',
    sequelize,
  }
);

export default DonateRoles;

DonateRoles.sync();
