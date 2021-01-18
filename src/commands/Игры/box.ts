import {
  Collection,
  Message,
  MessageEmbed,
  MessageReaction,
  User,
} from 'discord.js';
import { randomInteger } from '../../utils';
import config from '../../config';
import store from './box-questions.json';
import * as economy from '../../modules/economy';

const awardCookies = 50;
const timeoutSeconds = 15; // Секунд
const body = {
  color: config.colors.message,
  author: {
    name: 'Вопрос из коробки ...',
  },
  footer: {
    text: `На ответ ${timeoutSeconds} секунд`,
  },
};

const authorLink = 'Вопросы взяты с baza-otvetov.ru';

const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Коробка с вопросами :cookie:',
  aliases: ['trivia', 'quiz', 'quizbox'],
  cooldown: {
    seconds: 75600,
    messages: ['проверяю наличие наград в ящиках с вопросами (timeLeft)'],
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message) {
    const index = randomInteger(0, Object.keys(store).length - 1);

    const embed = new MessageEmbed(body)
      .setTitle(store[index].question)
      .setDescription(
        store[index].answers.map(
          (answer, index) => `**${index + 1}.** ${answer}`
        )
      );
    const msg = await message.channel.send(embed);

    let isSelect = false;

    // eslint-disable-next-line no-async-promise-executor
    new Promise(async () => {
      for (let n = 0; n < store[index].answers.length; n += 1) {
        await msg.react(numbers[n]);
        if (isSelect) {
          break;
        }
      }
    });

    const filter = (reaction: MessageReaction, user: User) =>
      user.id == message.author.id && numbers.includes(reaction.emoji.name);

    await msg
      .awaitReactions(filter, {
        max: 1,
        time: timeoutSeconds * 1000,
        errors: ['time'],
      })
      .then(async (collected: Collection<string, MessageReaction>) => {
        isSelect = true;
        const selectIndex = numbers.indexOf(collected.first()!.emoji.name);
        if (selectIndex == store[index].answerIndex) {
          await msg.edit(
            embed
              .addField(
                'Верно!',
                `В награду ты получаешь **+${awardCookies}**:cookie:`
              )
              .setDescription(
                store[index].answers.map((answer, i) => {
                  if (i === store[index].answerIndex) {
                    return `**${i + 1}.** ${answer} :white_check_mark:`;
                  }
                  return `**${i + 1}.** ${answer}`;
                })
              )
              .setFooter(authorLink)
          );
          await economy.setBalance(
            message.guild!.id,
            message.author.id,
            awardCookies
          );
        } else {
          await msg.edit(
            embed
              .addField('Не верно!', `Повезёт в следующий раз`)
              .setDescription(
                store[index].answers.map((answer, i) => {
                  if (i === store[index].answerIndex) {
                    return `**${i + 1}.** ${answer} :white_check_mark:`;
                  } else if (i === selectIndex) {
                    return `**${i + 1}.** ${answer} :x:`;
                  }
                  return `**${i + 1}.** ${answer}`;
                })
              )
              .setFooter(authorLink)
          );
        }
      })
      .catch(async () => {
        await msg.edit(embed.setFooter('Время вышло!'));
      });

    //await msg.reactions.removeAll(); // Создаёт лишнюю нагрузку, поэтому отключено
  },
};
