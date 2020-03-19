import * as Discord from 'discord.js';

import config from '../../config';
import * as tools from '../../utils/tools';
import { commands } from '../../client';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Список команд',
  aliases: ['commands'],
  usage: '[hide или имя команды]',
  guild: false,
  hide: true,
  cooldown: 3,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed();

    if (!args.length) {
      embed.setDescription(
        'Параметры обёрнутые в <> - обязательны, а в [] - нет'
      );
      embed.setAuthor('Список команд');
      const groups = [...new Set(commands.map(command => command.group))];
      for (const g of groups) {
        const catList = [
          ...new Set(
            commands
              .filter(cmd => cmd.hide !== true && cmd.group === g)
              .map(
                command =>
                  `${config.bot.prefix}**${command.name}** ${command.usage ||
                    ''} - ${command.description}`
              )
          ),
        ]
          .join('\n')
          .substring(0, 1024);
        if (catList) {
          embed.addField(g, catList, false);
        }
      }
      embed.addField(
        'Подробная информация о команде',
        `${config.bot.prefix}**${this.name}** [имя команды]`,
        false
      );
      embed.addField(
        'Скрытые команды',
        `${config.bot.prefix}**${this.name}** hide`,
        false
      );
    } else if (args[0] === 'hide') {
      embed.setDescription(
        'Параметры обёрнутые в <> - обязательны, а в [] - нет'
      );
      embed.setAuthor('Список скрытых команд');
      const groups = [...new Set(commands.map(command => command.group))];
      for (const g of groups) {
        const catList = [
          ...new Set(
            commands
              .filter(cmd => cmd.hide === true && cmd.group === g)
              .map(
                command =>
                  `${config.bot.prefix}**${command.name}** ${command.usage ||
                    ''} - ${command.description}`
              )
          ),
        ]
          .join('\n')
          .substring(0, 1024);
        if (catList) {
          embed.addField(g, catList, false);
        }
      }
      embed.addField(
        'Подробная информация о команде',
        `${config.bot.prefix}**${this.name}** [имя команды]`,
        false
      );
    } else {
      if (!commands.has(args[0])) {
        return message.reply(`команда \`${args[0]}\` не найдена!`);
      }

      const command = commands.get(args[0]);

      embed.setAuthor(
        `О команде: ${
          command.aliases
            ? `${command.name}, ${command.aliases.join(', ')}`
            : command.name
        }`,
        message.client.user.avatarURL
      );
      embed.setDescription(command.description || 'Описание отсутствует');
      if (command.usage) {
        embed.addField(
          '**Использовать так**',
          `${config.bot.prefix}${command.name} ${command.usage}`,
          false
        );
      }
      if (command.guild !== undefined) {
        embed.addField('**Доступна в ЛС**', command.guild ? 'Нет' : 'Да', true);
      }
      if (command.group) {
        embed.addField('**Категория**', command.group, true);
      }
      embed.addField(
        '**Откат**',
        tools.convertSecondsToTime(command.cooldown || 3),
        true
      );
      if (command.permissions) {
        embed.addField(
          '**Требуемые права**',
          command.permissions.join(', '),
          true
        );
      }
    }

    embed.setColor(tools.randomHexColor());

    if (message.guild !== null) {
      embed.setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
    }

    message.channel.send({ embed });
  },
};
