import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class DonateRoles extends Model {
  public serverId!: string;
  public roleId!: string;
  public cost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DonateRoles.init(
  {
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
