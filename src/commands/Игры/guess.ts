import { Collection, Message, MessageEmbed } from 'discord.js';
import { randomInteger } from '../../utils';
import * as economy from '../../modules/economy';
import config from '../../config';

const awardCookies = 50;
const timeoutSeconds = 15; // Секунд
const body = {
  color: config.colors.message,
  author: {
    name: 'Загадываю цифру от одного до трёх ...',
  },
  title: 'Попробуй угадать!',
  footer: {
    text: `Время на ответ: ${timeoutSeconds} секунд`,
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Угадай цифру и получи :cookie:',
  cooldown: {
    seconds: 75600,
    messages: ['придумываю новую цифру (timeLeft)'],
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message) {
    const num = randomInteger(1, 3);

    const embed = new MessageEmbed(body);
    const msg = await message.channel.send(embed);

    const filter = (messageCollection: Message) =>
      message.author.id === messageCollection.author.id;

    await message.channel
      .awaitMessages(filter, {
        max: 1,
        time: timeoutSeconds * 1000,
        errors: ['time'],
      })
      .then(async (collected: Collection<string, Message>) => {
        if (collected.first()?.content === num.toString()) {
          await msg.edit(
            embed
              .addField(
                `Верно, это ${num}!`,
                `В награду ты получаешь **+${awardCookies}**:cookie:`
              )
              .setFooter('')
          );
          economy.setBalance(
            message.guild!.id,
            message.author.id,
            awardCookies
          );
        } else {
          await msg.edit(
            embed
              .addField(`Не верно, это было ${num}!`, `Повезёт в следующий раз`)
              .setFooter('')
          );
        }
      })
      .catch(async () => {
        await msg.edit(embed.setFooter(`Время вышло! Я загадывала ${num}.`));
      });
  },
};
