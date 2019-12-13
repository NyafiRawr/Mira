const Discord = require('discord.js');
const economy = require('../../modules/economy.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Ежедневное печенье!',
  aliases: ['timely', 'цщкл'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 75600,
  cooldownMessage:
        [
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
  async execute(message/* , args, CooldownReset */) {
    const earned = tools.randomInteger(49, 101);

    await economy.set(message.guild.id, message.author.id, earned);

    const replyMessage = `${message.author} +**${tools.separateThousandth(earned)}**:cookie:`;
    const embed = new Discord.RichEmbed()
      .setDescription(`Теперь у вас ${tools.separateThousandth(await economy.get(message.guild.id, message.author.id))}:cookie:`);
    message.channel.send(replyMessage, { embed });
  },
};
