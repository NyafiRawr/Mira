import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';
import GildRelation from './GildRelation';

export default class Gild extends Model {
    public id!: number;
    public serverId!: string;
    public ownerId!: string;
    public name!: string;
    public description!: string | null;
    public imageURL!: string | null;
    public channels!: string | null;
    public balance!: number;
}

Gild.init(
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
        ownerId: {
            type: STRING,
            allowNull: false,
        },
        name: {
            type: STRING,
            allowNull: false,
        },
        description: {
            type: STRING,
            allowNull: true,
            defaultValue: null,
        },
        imageURL: {
            type: STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                isUrl: true,
            },
        },
        channels: {
            type: STRING,
            allowNull: true,
            defaultValue: null,
        },
        balance: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        modelName: 'gild',
        sequelize,
    }
);

Gild.hasMany(GildRelation, { foreignKey: 'gildId' });
