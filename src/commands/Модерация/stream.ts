import CustomError from '../../utils/customError';
import * as streams from '../../modules/streams';
import { randomHexColor } from '../../utils/tools';
import * as Discord from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выдавать особую роль при стриме игр',
  aliases: undefined,
  usage: '[@роль] ИЛИ [add/rem <игра>, игра, ...] ИЛИ [on/off]',
  guild: true,
  hide: true,
  cooldown: 1,
  permissions: ['MANAGE_ROLES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять ролями!');
    }
    if (!message.guild.me.hasPermission(this.permissions[0])) {
      throw new CustomError('у меня нет права управлять ролями!');
    }

    const stream = await streams.get(message.guild.id);

    if (!args.length) {
      message.reply({
        embed: {
          title: this.description,
          fields: [
            {
              name: 'Роль',
              value: !!stream?.roleId ? `<@&${stream.roleId}>` : 'Не указана',
              inline: true
            },
            {
              name: 'Состояние',
              value: !!stream?.state ? 'Выдаётся' : ' Не выдаётся',
              inline: true
            },
            {
              name: 'Игры',
              value: !!stream?.games ? `${stream.games}` : 'Нет',
              inline: false
            }
          ],
          color: parseInt(randomHexColor().slice(1), 10),
        },
      });
    } else if (message.mentions.roles.size > 0) {
      await streams.set(message.guild.id, { roleId: message.mentions.roles.first().id });
      message.reply(`выдаваемая стримерам роль: ${message.mentions.roles.first()}`
      + `\nВажно: не могу выдать/снять роль, которая выше или равна моей наивысшей!`);
    } else if (args[0] === 'on' || args[0] === 'off') {
      await streams.set(message.guild.id, { state: args[0] === 'on' ? true : false });
      message.reply(`состояние выдачи: ${args[0] === 'on' ? 'выдаётся' : 'не выдаётся'}`);
    } else if ((args[0] === 'add' || args[0] === 'rem') && args.length > 1) {
      const input = args.slice(1).join(' ').split(', ');
      let newGames: string[] = [];
      if (args[0] === 'add') {
        if (!!stream?.games) {
          newGames = stream.games.split(', ');
        }
        newGames = [...new Set(newGames.concat(input))];
      } else {
        if (!stream?.games) {
          throw new CustomError('нет игр для удаления.');
        }
        const oldGames = stream.games.split(', ');
        newGames = oldGames.filter((game) => !input.includes(game));
      }
      await streams.set(message.guild.id, { games: newGames.join(', ') });
      message.reply(`отслеживаемые игры: ${!!newGames ? newGames.join(', ') : 'Нет'}`);
    } else {
      throw new CustomError(`неправильно указаны параметры: \`${this.usage}\``);
    }
  },
};
