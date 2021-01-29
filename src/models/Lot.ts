import { Model, STRING, INTEGER } from 'sequelize';
import config from '../config';
import { sequelize, alter, force } from '../database';
import LotRelation from './LotRelation';

export default class Lot extends Model {
  public id!: number;
  public serverId!: string;
  public userId!: string;
  public prize!: number;
  public membersWait!: number;
}

Lot.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    serverId: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    prize: {
      type: INTEGER,
      allowNull: false,
      defaultValue: config.games.lottery.betMin,
    },
    membersWait: {
      type: INTEGER,
      allowNull: false,
      defaultValue: config.games.lottery.maxMembers,
    },
  },
  {
    modelName: 'lot',
    sequelize,
  }
);

Lot.hasMany(LotRelation, {
  foreignKey: 'lotteryId',
});
