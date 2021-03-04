import { Model, STRING, DATE, INTEGER } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class MuteList extends Model {
    public id!: number;
    public serverId!: string;
    public userId!: string;
    public reason!: string;
    public executorId!: string;
    public channelName!: string;
    public releaseDate!: Date;
    public createdAt!: Date;
}

MuteList.init(
    {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        serverId: {
            type: STRING,
            allowNull: false,
            unique: 'perServerOneMuteForUser',
        },
        userId: {
            type: STRING,
            allowNull: false,
            unique: 'perServerOneMuteForUser',
        },
        reason: {
            type: STRING,
            allowNull: false,
        },
        executorId: {
            type: STRING,
            allowNull: false,
        },
        channelName: {
            type: STRING,
            allowNull: false,
        },
        releaseDate: {
            type: DATE,
            allowNull: false,
        },
    },
    {
        modelName: 'mute_list',
        sequelize,
        timestamps: true,
    }
);

MuteList.sync({ alter, force });
