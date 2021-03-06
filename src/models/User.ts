import { Model, STRING, DATE, DATEONLY, INTEGER, NOW } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class User extends Model {
    public id!: number;
    public userId!: string;
    public serverId!: string;
    public balance!: number;
    public birthday!: Date | null;
    public entryFirstDate!: Date;
    public reputation!: number;
    public voiceSeconds!: number;
    public biographyDescription!: string | null;
    public biographyImageUrl!: string | null;
    public biographyLineColor!: string | null;
}

User.init(
    {
        id: {
            type: INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: STRING,
            allowNull: false,
            unique: 'usersOnDifferentServers',
        },
        serverId: {
            type: STRING,
            allowNull: false,
            unique: 'usersOnDifferentServers',
        },
        entryFirstDate: {
            type: DATE,
            allowNull: false,
            defaultValue: NOW,
        },
        birthday: {
            type: DATEONLY,
            allowNull: true,
            defaultValue: null,
        },
        balance: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        reputation: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        voiceSeconds: {
            type: INTEGER,
            allowNull: false,
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
            validate: {
                isUrl: true,
            },
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

User.sync({ alter, force });
