import CustomError from '../../utils/customerror';
import * as vars from '../../modules/vars';
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
      throw new CustomError('тебе нужно иметь право управлять ролями!');
    }
    if (!message.guild.me.hasPermission(this.permissions[0])) {
      throw new CustomError('у меня нет права управлять ролями!');
    }

    const names = {
      role: this.name + '_' + 'roleId',
      state: this.name + '_' + 'state',
      games: this.name + '_' + 'games'
    };

    const stream = {
      roleId: await vars.get(message.guild.id, names.role, null),
      state: await vars.get(message.guild.id, names.state, null),
      games: await vars.get(message.guild.id, names.games, '')
    };

    if (!args.length) {
      message.reply({
        embed: {
          title: this.description,
          fields: [
            {
              name: 'Роль',
              value: !!stream.roleId ? `<@&${stream.roleId}>` : 'Не указана',
              inline: true
            },
            {
              name: 'Состояние',
              value: !!stream.state && !!stream.roleId && !!stream.games ? 'Выдаётся' : 'Не выдаётся',
              inline: true
            },
            {
              name: 'Игры',
              value: stream.games.length ? stream.games : 'Нет',
              inline: false
            }
          ],
          color: parseInt(randomHexColor().slice(1), 10),
        },
      });
    } else if (message.mentions.roles.size > 0) {
      await vars.set(message.guild.id, names.role, message.mentions.roles.first().id);
      message.reply(`выдаваемая стримерам роль: ${message.mentions.roles.first()}`
      + `\nВажно: не могу выдать/снять роль, которая выше или равна моей наивысшей!`);
    } else if (args[0] === 'on' || args[0] === 'off') {
      await vars.set(message.guild.id, names.state, args[0] === 'on' ? true : false);
      message.reply(`состояние выдачи: ${args[0] === 'on' ? 'выдаётся' : 'не выдаётся'}`
      + `\nВажно: если поля роль или игры пустые выдача не будет осуществляться!`);
    } else if ((args[0] === 'add' || args[0] === 'rem') && args.length > 1) {
      const input = args.slice(1).join(' ').split(', ');
      let newGames: string[] = [];
      if (args[0] === 'add') {
        if (!!stream?.games) {
          newGames = stream.games.split(', ');
        }
        newGames = [...new Set(newGames.concat(input))];
      } else {
        if (!stream.games) {
          throw new CustomError('нет игр для удаления.');
        }
        const oldGames = stream.games.split(', ');
        newGames = oldGames.filter((game) => !input.includes(game));
      }
      await vars.set(message.guild.id, names.games, newGames.join(', '));
      message.reply(`отслеживаемые игры: ${!!newGames ? newGames.join(', ') : 'Нет'}`);
    } else {
      throw new CustomError(`неправильно указаны параметры: \`${this.usage}\``);
    }
  },
};
