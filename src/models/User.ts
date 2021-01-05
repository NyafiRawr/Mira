import { Model, STRING, DATE, DATEONLY, INTEGER, NOW } from 'sequelize';
import { sequelize } from '../database';

export default class User extends Model {
  public userId!: string;
  public serverId!: string;
  public balance!: number;
  public birthday?: Date | null;
  public entryFirstDate!: Date;
  public reputation!: number;
  public voiceSeconds!: number;
  public biographyDescription?: string | null;
  public biographyImageUrl?: string | null;
  public biographyLineColor?: string | null;
}

User.init(
  {
    userId: {
      type: STRING,
      primaryKey: true,
    },
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    entryFirstDate: {
      type: DATE,
      defaultValue: NOW,
    },
    birthday: {
      type: DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    balance: {
      type: INTEGER,
      defaultValue: 0,
    },
    reputation: {
      type: INTEGER,
      defaultValue: 0,
    },
    voiceSeconds: {
      type: INTEGER,
      defaultValue: 0,
    },
    biographyDescription: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    biographyImageUrl: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    biographyLineColor: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    modelName: 'user',
    sequelize,
  }
);

User.sync({ force: false });
