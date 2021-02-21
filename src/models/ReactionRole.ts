import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class ReactionRole extends Model {
    public id: number;
    public serverId!: string;
    public channelId!: string;
    public messageId!: string;
    public roleId!: string;
    public reaction!: string;
}

ReactionRole.init(
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
        },
        channelId: {
            type: STRING,
            allowNull: false,
        },
        messageId: {
            type: STRING,
            allowNull: false,
        },
        roleId: {
            type: STRING,
            allowNull: false,
        },
        reaction: {
            type: STRING,
            allowNull: false,
        },
    },
    {
        modelName: 'reaction_role',
        sequelize,
    }
);

ReactionRole.sync({ alter, force });
