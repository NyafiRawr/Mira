import { Collection, Message, MessageEmbed } from 'discord.js';
import { randomInteger, randomBoolean, separateThousandth } from '../../utils';
import * as economy from '../../modules/economy';
import * as users from '../../modules/users';
import config from '../../config';

const body = {
  author: {
    name: 'Слот-машина',
  },
};

const means = ['🍔', '🍕', '🍜', '🍟', '🍰'];

// serverId_userId, currency
const bank = new Collection<string, number>();

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Слот-машина, совпадения и удача :strawberry:',
  aliases: ['slots'],
  usage: '[take ИЛИ bonus]',
  cooldown: {
    seconds: 0.5,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const embed = new MessageEmbed(body);
    let virtualCurrency: number =
      bank.get(`${message.guild!.id}_${message.author.id}`) || 0;

    if (args.length === 0) {
      const rep = (await users.get(message.guild!.id, message.author.id))
        .reputation;
      return message.channel.send(
        embed
          .setColor('#ff8040')
          .setTitle('Игровой автомат')
          .setDescription(
            'Существующие комбинации (столбцы: 1,2,3) `1 = 2 = 3`, `1 = 2` или `1 = 3` или `2 = 3`, остальное зависит от случайно выпадающего бонуса "Удача"!'
          )
          .addField(
            'Команды',
            `\`${config.discord.prefix}${this.name} <ставка>\` - запуск игры (ставка берётся из :strawberry:, если её нет, то 1:cookie: -> 1:strawberry:)` +
              `\n\`${config.discord.prefix}${
                this.name
              } take\` - забрать выигрыш (${separateThousandth(
                config.games.slots.convertCookie.toString()
              )}:strawberry: -> 1:cookie:)` +
              `\n\`${config.discord.prefix}${
                this.name
              } bonus\` - забрать халявные 20-${100 + rep}:strawberry:`
          )
          .setFooter(
            `На счету: ${separateThousandth(
              virtualCurrency.toString()
            )}🍓 | Максимум: ${separateThousandth(
              config.games.slots.limitVirtualCurrency.toString()
            )}🍓`
          )
      );
    }

    if (args.join() === 'take') {
      if (virtualCurrency < config.games.slots.convertCookie) {
        throw new Error(
          `минимальная сумма конвертации: ${separateThousandth(
            config.games.slots.convertCookie.toString()
          )}:strawberry:`
        );
      }

      const cookie = Math.floor(
        virtualCurrency / config.games.slots.convertCookie
      );
      virtualCurrency %= config.games.slots.convertCookie;

      bank.set(`${message.guild!.id}_${message.author.id}`, virtualCurrency);
      await economy.setBalance(message.guild!.id, message.author.id, cookie);

      return message.channel.send(
        embed
          .setColor('#0080c0')
          .setTitle('Ковертация валюты')
          .setDescription(
            `${separateThousandth(
              (cookie * config.games.slots.convertCookie).toString()
            )}:strawberry: -> ${separateThousandth(cookie.toString())}:cookie:`
          )
          .addField(
            'Остаток',
            `${separateThousandth(virtualCurrency.toString())}:strawberry:`
          )
      );
    }

    if (virtualCurrency > config.games.slots.limitVirtualCurrency) {
      throw new Error(
        'достигнут предел :strawberry:, используй команду вывода, чтобы забрать выигрыш.'
      );
    }

    if (args.join() === 'bonus') {
      const rep = (await users.get(message.guild!.id, message.author.id))
        .reputation;

      const bonus = randomInteger(20, 100 + rep);
      virtualCurrency += bonus;

      bank.set(`${message.guild!.id}_${message.author.id}`, virtualCurrency);

      return message.reply(`тебе выпало +${bonus}:strawberry:`);
    }

    // Ставка
    const bet = parseInt(args.join(), 10);
    if (Number.isInteger(bet) === false) {
      throw new Error('ставка не указана или указана не верно.');
    } else if (bet <= 2) {
      throw new Error('слишком маленькая ставка.');
    }

    if (virtualCurrency < bet) {
      const enoughtCookie = virtualCurrency - bet;
      await economy.setBalance(
        message.guild!.id,
        message.author.id,
        enoughtCookie
      );
      virtualCurrency += Math.abs(enoughtCookie);
      bank.set(`${message.guild!.id}_${message.author.id}`, virtualCurrency);
    }

    // Запускаем слот-машину
    const a = randomInteger(0, means.length - 1);
    const b = randomInteger(0, means.length - 1);
    const c = randomInteger(0, means.length - 1);

    let bonusText = 'Без бонусов';
    const lucky = randomBoolean();
    if (lucky) {
      bonusText = 'Выпал бонус: Удача!';
    }

    let award = bet;
    // Комбинации
    if (a == b && b == c) {
      if (lucky) {
        award *= 4;
        embed
          .setTitle('Успех!')
          .setColor('#28ff5f')
          .setDescription('Ставка умножена в 4 раза!')
          .addField(
            bonusText,
            `Получено: ${separateThousandth(award.toString())}:strawberry:`
          );
      } else {
        award *= 3;
        embed
          .setTitle('Поздравляю!')
          .setColor('#28ff5f')
          .setDescription('Ставка умножена в 3 раза!')
          .addField(
            bonusText,
            `Получено: ${separateThousandth(award.toString())}:strawberry:`
          );
      }
    } else if (a == b || b == c || a == c) {
      embed.setTitle('Почти получилось!');
      if (lucky) {
        award *= 2;
        embed
          .setColor('#28ff5f')
          .setDescription('Но ставка не потеряна и умножена в 2 раза! ')
          .addField(
            bonusText,
            `Получено: ${separateThousandth(award.toString())}:strawberry:`
          );
      } else {
        award = Math.round(award / 2);
        embed
          .setColor('#ffff4f')
          .setDescription('Отнята часть ставки')
          .addField(
            bonusText,
            `Потеряно: ${separateThousandth(award.toString())}:strawberry:`
          );
        award = -award;
      }
    } else {
      embed.setTitle('Не повезло'!);
      if (lucky) {
        award = 1;
        embed
          .setColor('#ffff4f')
          .setDescription('Из-за бонуса ты ничего не потерял! ')
          .addField(bonusText, 'Держи :strawberry:!');
      } else {
        embed
          .setColor('#ff4040')
          .setDescription('Ничего совпадающего не выпало')
          .addField(
            bonusText,
            `Потеряно: ${separateThousandth(award.toString())}:strawberry:`
          );
        award = -award;
      }
    }

    virtualCurrency += award;

    bank.set(`${message.guild!.id}_${message.author.id}`, virtualCurrency);

    return message.channel.send(
      `${means[a]}${means[b]}${means[c]}`,
      embed.setFooter(
        `На счету: ${separateThousandth(
          virtualCurrency.toString()
        )}🍓 | Сгорают с перезагрузкой`
      )
    );
  },
};
