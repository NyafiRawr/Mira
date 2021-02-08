import * as users from '../../modules/users';
import * as gilds from '../../modules/gilds';
import { GuildMember, Message } from 'discord.js';
import * as gildrelations from '../../modules/gildrelations';
import {
  checkUrl,
  secondsFormattedHMS,
  timeFomattedDMY,
  timeLifeFormattedYMD,
} from '../../utils';
import config from '../../config';

const repDesc = 5;
const repImg = 10;
const repColor = 1;

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Профиль пользователя',
  aliases: ['userinfo', 'u'],
  usage: '[@ ИЛИ edit]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (args.shift() == 'edit') {
      const element = args.shift();
      const source = args.join(' ');
      let user = await users.get(message.guild!.id, message.author.id);
      switch (element) {
        case 'desc': {
          if (user.reputation < repDesc) {
            throw new Error(
              `не хватает ${
                repDesc - user.reputation
              } оч. кармы, после этого можно редактировать сколько угодно.`
            );
          }

          if (source == undefined) {
            user = await user.update({ biographyDescription: null });
          } else {
            user = await user.update({ biographyDescription: source });
          }
          break;
        }
        case 'img': {
          if (user.reputation < repImg) {
            throw new Error(
              `не хватает ${
                repImg - user.reputation
              } оч. кармы, после этого можно редактировать сколько угодно.`
            );
          }

          if (source == undefined) {
            user = await user.update({ biographyImageUrl: null });
          } else {
            if ((await checkUrl(source, 'image')) === false) {
              throw new Error(
                'такой ссылки не существует или она не поддерживается!'
              );
            }
            user = await user.update({ biographyImageUrl: source });
          }
          break;
        }
        case 'color': {
          if (user.reputation < repColor) {
            throw new Error(
              `не хватает ${
                repColor - user.reputation
              } оч. кармы, после этого можно редактировать сколько угодно.`
            );
          }

          if (source == undefined) {
            user = await user.update({ biographyLineColor: null });
          } else {
            if (config.patternHexColor.test(source) == false) {
              throw new Error('цвет должен быть указан в формате HEX.');
            }
            user = await user.update({ biographyLineColor: source });
          }
          break;
        }
        default: {
          await message.channel.send({
            embed: {
              color: message.member!.displayColor,
              title: this.description,
              fields: [
                {
                  name: 'Редактировать',
                  value:
                    `\n\`${config.discord.prefix}${this.name} edit desc [новое описание]\` - изменить описание [или удалить]` +
                    `\n\`${config.discord.prefix}${this.name} edit img [ссылка]\` - добавить картинку или гифку [или удалить]` +
                    `\n\`${config.discord.prefix}${this.name} edit color [#hex]\` - изменить цвет полоски на свой [или удалить]`,
                },
              ],
              footer: {
                text:
                  'По умолчанию полоска красится в цвет твоего ника на сервере',
              },
            },
          });
          return;
        }
      }
    }
    const member: GuildMember | undefined | null =
      message.mentions.members?.first() || message.member;

    if (!member) {
      throw new Error(`не удалось найти указанного участника.`);
    }

    const user = await users.get(message.guild!.id, member.id);

    let gild = null;
    const relation = await gildrelations.getOne(message.guild!.id, member.id);
    if (relation) {
      gild = await gilds.getOne(relation.gildId);
    }

    await message.channel.send({
      embed: {
        color: user.biographyLineColor || member.displayHexColor,
        title: 'Профиль',
        image: { url: user.biographyImageUrl || '' },
        description: user.biographyDescription || '',
        thumbnail: { url: member.user.avatarURL() || '' },
        fields: [
          { name: 'Упоминание', value: member, inline: true },
          { name: 'Гильдия', value: gild?.name || 'Нет', inline: true },
          { name: 'Карма', value: `${user.reputation} F`, inline: true },
          {
            name: 'Создан',
            value: timeFomattedDMY(member.user.createdAt.getTime()),
            inline: true,
          },
          {
            name: 'Появился здесь',
            value: timeFomattedDMY(
              (user.entryFirstDate || member.joinedAt).getTime()
            ),
            inline: true,
          },
          {
            name: 'Время в голосе',
            value: secondsFormattedHMS(user.voiceSeconds),
            inline: true,
          },
        ],
        author: {
          name: `На сервере уже ${timeLifeFormattedYMD(
            (member.joinedAt || user.entryFirstDate).getTime()
          )}`,
        },
        footer: {
          text: `Возраст: ${
            user.birthday
              ? timeLifeFormattedYMD(new Date(user.birthday).getTime())
              : 'неизвестно'
          }`,
        },
      },
    });
  },
};
