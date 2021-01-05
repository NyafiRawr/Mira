import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import config from '../../config';
import * as rrs from '../../modules/rrs';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Роль по реакции к сообщению',
  aliases: ['reactrole'],
  usage:
    '[add <#канал> <id-сообщения> <реакция> <@роль> ИЛИ rem <номер удаления>]',
  permissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (args.length == 0) {
      const list = await rrs.getAll(message.guild!.id);
      return message.channel.send({
        embed: {
          color: config.colors.message,
          author: { name: this.description },
          title: 'Список',
          description:
            list
              .map(
                (rr) =>
                  `[**${rr.id}.**](https://discord.com/channels/${
                    message.guild!.id
                  }/${rr.channelId}/${rr.messageId}) ${rr.reaction} <@&${
                    rr.roleId
                  }>`
              )
              .join('\n')
              .substr(0, 2000) || 'Пусто',
          fields: [
            {
              name: 'Помощь',
              value:
                `\`${config.discord.prefix}${this.name} add <#канал> <id-сообщения> <реакция> <@роль>\` - добавить` +
                `\n\`${config.discord.prefix}${this.name} rem <номер удаления>\` - удалить по номеру из базы данных`,
            },
          ],
          footer: {
            text: 'На цифры можно нажимать они перенесут вас к сообщению',
          },
        },
      });
    }

    if (!message.member?.hasPermission(this.permissions[0])) {
      throw new Error(
        `тебе нужно иметь глобальное право ${this.permissions[0]}.`
      );
    }
    if (!message.guild!.me?.hasPermission(this.permissions[0])) {
      throw new Error(
        `мне нужно иметь глобальное право ${this.permissions[0]}.`
      );
    }

    const action = args.shift();
    switch (action) {
      case 'add': {
        const channel = message.mentions.channels.first();
        if (channel == undefined) {
          throw new Error(`канал не найден или не указан.`);
        }

        const messageId = args[1];
        const messageFetch = await channel.messages
          .fetch(messageId)
          .catch(() => null);
        if (messageFetch == null) {
          throw new Error(
            `сообщение \`${messageId}\` не найдено в ${channel}!`
          );
        }

        const reaction = args[2];
        if (reaction == undefined) {
          throw new Error('реакция не указана.');
        }

        const role = message.mentions.roles.first();
        if (role == undefined) {
          throw new Error(`не упомянута роль.`);
        }

        await rrs.set(
          message.guild!.id,
          channel.id,
          messageId,
          role.id,
          reaction
        );

        await messageFetch.react(reaction).catch();

        return message.reply('связка роль-реакция добавлена.');
      }
      case 'rem': {
        const param = args.shift();
        if (param == undefined) {
          throw new Error('не указан номер для удаления.');
        }
        const id = parseInt(param, 10);
        if (isInteger(id) == false) {
          throw new Error('неправильно указан номер для удаления.');
        }
        await rrs.removeById(id);
        return message.reply('связка роль-реакция удалена.');
      }
      default: {
        throw new Error('команда не распознана.');
      }
    }
  },
};
