import * as Discord from 'discord.js';

import * as users from '../../modules/users';
import * as tools from '../../utils/tools';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Ежедневное печенье!',
  aliases: ['timely', 'цщкл'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 75600,
  cooldownMessage: [
    'ты сегодня уже получал печенье! Неужели все съел?! (leftTime)',
    'а тебя толстая девочка в садике не кусала? (leftTime)',
    'ничто так не нарушает красоту души и очарование внутреннего мира, как толстая попа (leftTime)',
    'скрыть возраст легко, вес – гораздо сложнее (leftTime)',
    'переедание гасит блеск в наших глазах! (leftTime)',
    'вновь хочешь печенья? Ну уж нет, нельзя так торопить приход диабета! (leftTime)',
    'дети до семи лет должны есть больше сладостей, чтобы у них молочные зубы выпадали и вырастали новые и красивые, но тебе вот совсем не семь лет (leftTime)',
    'если счастье не в печенье, то в чем? Но не будем забывать, что все должно быть в меру (leftTime)',
    'конфеты придуманы для счастливых людей, чтобы сделать их жизнь ещё слаще, но когда конфеты начинают есть несчастные люди – это приводит их к ожирению (leftTime)',
    'детям мучное вредно. Отдай печеньку! (leftTime)',
    'пеку-пеку! (leftTime)',
  ],
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message /* , args, CooldownReset */) {
    const earned = tools.randomInteger(49, 101);

    await economy.set(message.guild.id, message.author.id, earned);

    const user = await users.get(message.guild.id, message.author.id);

    const replyMessage = `${message.author} +**${tools.separateThousandth(
      earned.toString()
    )}**:cookie:`;

    const embed = new Discord.RichEmbed().setDescription(
      `Теперь у вас ${tools.separateThousandth(user?.balance)}:cookie:`
    );
    message.channel.send(replyMessage, { embed });
  },
};
