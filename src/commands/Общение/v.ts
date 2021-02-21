import { Message } from 'discord.js';
import config from '../../config';
import * as tempvoices from '../../modules/tempvoices';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: `Автосоздание временных голосовых чатов`,
  aliases: ['voice'],
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'lock': {
        await tempvoices.changeState(message.author, true);
        return message.reply('голосовой канал заблокирован 🔒');
      }
      case 'unlock': {
        await tempvoices.changeState(message.author, false);
        return message.reply('голосовой канал разблокирован 🔓');
      }
      case 'set': {
        if (message.member?.hasPermission(this.permissions[0]) == null) {
          throw new Error(
            `нужно иметь глобальную привилегию: ${this.permissions[0]}.`
          );
        }

        const channelId = args.shift();
        if (channelId == null) {
          await tempvoices.removeTempVoiceCreaterId(message.guild!.id);
          return message.reply(`автосоздание голосовых чатов отключено.`);
        } else {
          const voice = message.guild!.channels.cache.get(channelId);
          if (voice == null || voice.type !== 'voice') {
            throw new Error('голосовой канал не найден.');
          }

          await tempvoices.setTempVoiceCreaterId(message.guild!.id, voice.id);
          return message.reply(
            `<#${voice.id}> теперь используется для создания временных каналов.`
          );
        }
      }
      case 'invite': {
        const member = message.mentions.members?.first();

        if (member == null) {
          throw new Error('ты не упомянул, кого нужно пригласить.');
        }

        const cvc = await tempvoices.invite(message.author, member);

        return message.channel.send(
          `${member.toString()} приглашен в <#${cvc.voice.id}>`
        );
      }
      case 'kick': {
        const member = message.mentions.members?.first();

        if (member == null) {
          throw new Error('ты не упомянул, кого нужно пригласить.');
        }

        const cvc = await tempvoices.kick(message.author, member);

        return message.channel.send(
          `${member.toString()} кикнут из <#${cvc.voice.id}>`
        );
      }
      case 'limit': {
        const limit = Math.min(Number(args[0]) || 0, 99);

        await tempvoices.setLimit(message.author, limit);
        return message.reply(`теперь максимум ${limit}`);
      }
      default: {
        const channelId = await tempvoices.getTempVoiceCreaterId(
          message.guild!.id
        );
        const channel =
          channelId === null
            ? null
            : message.guild!.channels.resolve(channelId);
        return message.channel.send({
          embed: {
            color: config.colors.message,
            title: this.description,
            description:
              channel == null
                ? `Автосоздание отключено. Используй настройки администратора, чтобы включить`
                : `Чтобы создать свой голосовой чат нужно зайти в [${
                    channel.name
                  }](${await channel.createInvite()})`,
            fields: [
              {
                name: 'Команды владельца канала',
                value: [
                  `\`${config.discord.prefix}${this.name} invite <@>\` - пригласить @`,
                  `\`${config.discord.prefix}${this.name} kick <@>\` - выкинуть @ и запретить доступ`,
                  `\`${config.discord.prefix}${this.name} limit [2-99]\` - ограничить размер канала [или убрать ограничение]`,
                  `\`${config.discord.prefix}${this.name} lock\` - заблокировать видимость и возможность подключаться`,
                  `\`${config.discord.prefix}${this.name} unlock\` - разрешить всем видеть и подключаться к каналу`,
                ],
                inline: false,
              },
              {
                name: 'Настройки администратора',
                value: [
                  `\`${config.discord.prefix}${this.name} set [ID]\` - указать голосовой чат для создания других [или отключить]`,
                ],
                inline: false,
              },
            ],
          },
        });
      }
    }
  },
};
