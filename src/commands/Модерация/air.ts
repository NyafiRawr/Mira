import { Message } from 'discord.js';
import config from '../../config';
import * as airs from '../../modules/airs';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Выдача эфирной роли при стриме игр',
    aliases: ['stream'],
    usage: '[role [@] ИЛИ add <игра> ИЛИ rem [игра]]',
    permissions: ['MANAGE_ROLES'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        let games = await airs.getGames(message.guild!.id);

        if (args.length != 0) {
            if (!message.member?.hasPermission(this.permissions[0])) {
                throw new Error(
                    `нужно иметь глобальную привилегию ${this.permissions[0]}.`
                );
            }
            if (!message.guild!.me?.hasPermission(this.permissions[0])) {
                throw new Error(
                    `мне не хватает глобального права ${this.permissions[0]}.`
                );
            }

            switch (args.shift()) {
                case 'role': {
                    const role = message.mentions.roles.first();
                    if (role == undefined) {
                        await airs.setRoleId(message.guild!.id, null);
                    } else {
                        await airs.setRoleId(message.guild!.id, role.id);
                    }
                    break;
                }
                case 'add': {
                    const name = args.join(' ');
                    if (name.length == 0) {
                        throw new Error(
                            'не указано название игры для добавления.'
                        );
                    }
                    games.push(name);
                    await airs.setGames(message.guild!.id, games);
                    break;
                }
                case 'rem': {
                    const name = args.join(' ');
                    if (name.length == 0 || games.length == 0) {
                        await airs.setGames(message.guild!.id, null);
                        games = [];
                    } else {
                        games = games.filter((gameName) => gameName != name);
                        await airs.setGames(message.guild!.id, games);
                    }
                    break;
                }
                default: {
                    throw new Error(
                        'желаемое действие не указано или указано с ошибкой.'
                    );
                }
            }
        }

        const roleId = await airs.getRoleId(message.guild!.id);
        const status = !(roleId == null || games.length == 0);
        message.channel.send({
            embed: {
                color: config.colors.message,
                author: { name: this.description },
                title: status ? 'Включено' : 'Отключено',
                description:
                    '**Роль:** ' +
                    (roleId ? `<@&${roleId}>` : 'Не установлена'),
                fields: [
                    {
                        name: 'Названия игр',
                        value: games.length
                            ? `**${games.join('**, **')}**`
                            : 'Пусто',
                        inline: false,
                    },
                    {
                        name: 'Помощь',
                        value:
                            `\`${config.discord.prefix}${this.name} role <@>\` - установить эфирную роль` +
                            `\n\`${config.discord.prefix}${this.name} role\` - удалить эфирную роль` +
                            `\n\`${config.discord.prefix}${this.name} add <игра>\` - добавить название игры в список` +
                            `\n\`${config.discord.prefix}${this.name} rem [игра]\` - удалить название игры из списка` +
                            `\n\`${config.discord.prefix}${this.name} rem\` - очистить списк названий игр`,
                        inline: false,
                    },
                ],
                footer: {
                    text: status
                        ? 'Если выдача не работает, то проверьте, есть ли у меня право управления ролями'
                        : 'Нужно установить роль и минимум одну игру для включения',
                },
            },
        });
    },
};
