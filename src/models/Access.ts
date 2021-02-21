import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class Access extends Model {
    public id!: number;
    public serverId!: string;
    public channelId!: string | null;
    public commandName!: string | null;
}

Access.init(
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
            allowNull: true,
            defaultValue: null,
        },
        commandName: {
            type: STRING,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        modelName: 'access',
        sequelize,
    }
);

Access.sync({ alter, force });
