import { Message } from 'discord.js';
import config from '../../config';
import { create } from './Гильдия/create';
import { edit } from './Гильдия/edit';
import { invite } from './Гильдия/invite';
import { kick } from './Гильдия/kick';
import { leave } from './Гильдия/leave';
import { buy } from './Гильдия/buy';
import { sell } from './Гильдия/sell';
import { info } from './Гильдия/info';
import { price } from './Гильдия/price';
import { store } from './Гильдия/store';
import { list } from './Гильдия/list';
import { dissolve } from './Гильдия/dissolve';
import * as gilds from '../../modules/gilds';
import * as gildrelations from '../../modules/gildrelations';
import { separateThousandth } from '../../utils';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Гильдия',
  aliases: ['guild', 'guilds'],
  cooldown: {
    seconds: 3,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'create': {
        return create(message, args);
      }
      case 'edit': {
        return edit(message, args);
      }
      case 'invite': {
        return invite(message, args);
      }
      case 'kick': {
        return kick(message, args);
      }
      case 'leave': {
        return leave(message, args);
      }
      case 'buy': {
        return buy(message, args);
      }
      case 'sell': {
        return sell(message, args);
      }
      case 'info': {
        return info(message, args);
      }
      case 'list': {
        return list(message, args);
      }
      case 'store': {
        return store(message, args);
      }
      case 'price': {
        return price(message, args);
      }
      case 'dissolve': {
        return dissolve(message, args);
      }
      case 'yes': {
        const gildId = gilds.invites.get(message.author.id);
        if (gildId != undefined) {
          gilds.invites.delete(message.author.id);

          const gild = await gilds.getOne(message.guild!.id, gildId);
          if (gild == null) {
            throw new Error('к сожалению, эта гильдия уже была распущена.');
          }

          await gildrelations.create(
            message.guild!.id,
            message.author.id,
            gildId
          );

          if (gild.channels != null) {
            try {
              const channels = JSON.parse(gild.channels);
              channels.texts.map(async (channelId: string) => {
                const channel = message.guild?.channels.resolve(channelId);
                await channel?.updateOverwrite(message.author.id, {
                  VIEW_CHANNEL: true,
                });
              });
              channels.voices.map(async (channelId: string) => {
                const channel = message.guild?.channels.resolve(channelId);
                await channel?.updateOverwrite(message.author.id, {
                  VIEW_CHANNEL: true,
                });
              });
            } catch {
              message.reply(
                'не удалось выдать права доступа к каналам гильдии, возможно у меня нет прав.'
              );
            }
          }

          message.reply(
            `ты принял приглашение и стал частью гильдии **${gild?.name}**!`
          );
        } else {
          message.reply('у тебя нет приглашения, чтобы принимать его.');
        }
        return;
      }
      case 'no': {
        if (gilds.invites.has(message.author.id)) {
          message.reply(
            `ты отклонил приглашение в гильдию с ID: ${gilds.invites.get(
              message.author.id
            )}`
          );
          gilds.invites.delete(message.author.id);
        } else {
          message.reply('у тебя нет приглашения, чтобы отклонять его.');
        }
        return;
      }
      default: {
        return message.channel.send({
          embed: {
            color: config.colors.message,
            title: 'Гильдия',
            description:
              'Сплоченная группа участников, которые вместе ищут приключений. Приемуществом является наличие хранилища для печенья на которое можно приобретать текстовые и голосовые каналы!',
            fields: [
              {
                name: 'Вступить или создать свою',
                value:
                  `\`${config.discord.prefix}g list [номер страницы]\` - список гильдий` +
                  `\n\`${
                    config.discord.prefix
                  }g create <название>\` - создать за ${separateThousandth(
                    (await gilds.priceCreate(message.guild!.id)).toString()
                  )}:cookie:`,
                inline: false,
              },
              {
                name: 'Гильдмастер',
                value:
                  `\`${config.discord.prefix}g invite <@>\` - пригласить упомянутых` +
                  `\n\`${config.discord.prefix}g kick <@>\` - исключить упомянутых` +
                  `\n\`${
                    config.discord.prefix
                  }g edit img [ссылка]\` - изменить знамя ${separateThousandth(
                    (await gilds.priceEditImg(message.guild!.id)).toString()
                  )}:cookie:` +
                  `\n\`${
                    config.discord.prefix
                  }g edit desc [текст]\` - изменить описание ${separateThousandth(
                    (await gilds.priceEditDesc(message.guild!.id)).toString()
                  )}:cookie:` +
                  `\n\`${
                    config.discord.prefix
                  }g buy text <название>\` - купить текстовый канал ${separateThousandth(
                    (
                      await gilds.priceBuyChannelText(message.guild!.id)
                    ).toString()
                  )}:cookie:` +
                  `\n\`${
                    config.discord.prefix
                  }g buy voice <название>\` - купить голосовой канал ${separateThousandth(
                    (
                      await gilds.priceBuyChannelVoice(message.guild!.id)
                    ).toString()
                  )}:cookie:` +
                  `\n\`${config.discord.prefix}g sell <ID канала>\` - продать канал за цену покупки`,
                inline: false,
              },
              {
                name: 'Участник',
                value:
                  `\`${config.discord.prefix}g info [ID]\` - страница твоей гильдии или указанной по ID` +
                  `\n\`${config.discord.prefix}g store <кол-во>\` - пожертвовать печенье в хранилище :cookie:` +
                  `\n\`${config.discord.prefix}g leave\` - покинуть гильдию, если вы ГМ, то она будет распущена`,
                inline: false,
              },
              {
                name: 'Настройки',
                value:
                  `\`${config.discord.prefix}g price create <цена>\` - изменить цену на создание` +
                  `\n\`${config.discord.prefix}g price text <цена>\` - изменить цену покупки текстового канала` +
                  `\n\`${config.discord.prefix}g price voice <цена>\` - изменить цену покупки голосового канала` +
                  `\n\`${config.discord.prefix}g price desc <цена>\` - изменить цену редактирования описания` +
                  `\n\`${config.discord.prefix}g price img <цена>\` - изменить цену редактирования изображения` +
                  `\n\`${config.discord.prefix}g dissolve <ID>\` - принудительно распустить гильдию по ID`,
                inline: false,
              },
            ],
            footer: {
              text: 'Параметры обёрнутые в <> - обязательны, а в [] - нет',
            },
          },
        });
      }
    }
  },
};
