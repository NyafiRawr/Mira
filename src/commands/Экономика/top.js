const economy = require('../../modules/economy.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Печеньковые богачи',
  aliases: ['cootop', 'moneytop'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 60,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    const list = await economy.get(message.guild.id);
    if (!list) {
      return message.reply('в этом мире нет печенья... но я здесь и вместе мы сможем исправить это!');
    }
    // Определяем размер топа
    let topSize = 10;
    if (topSize > list.length) {
      topSize = list.length;
    }
    // Заполняем его нулевым ID
    let topList = [];
    for (let i = 0; i < topSize; i++) {
      topList[i] = 0;
    }
    // Делаем копию оригинального списка, убираем: "invalid-user" и ботов
    let copyList = [];
    for (let userObject of list) {
      let member = message.guild.members.get(userObject.id);
      if (!!member && !member.user.bot) {
        copyList[userObject.id] = userObject.balance;
      }
    }
    // Ставим участника для сравнения (любого, пусть будет первый)
    topList[0] = list[0].id; 
    // Формируем топ с помощью сортировки
    for (let i = 0; i < topSize; i++) {
      for (let userObject of copyList) {
        if (!(userObject.id in topList) && copyList[topList[i]] <= copyList[userObject.id]) {
        topList[i] = userObject.id;
        }
      }
    }
    // Красиво оформляем сообщение с топом
    let msg = '\n';
    let rangs = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII','VIII', 'IX', 'X'];
    for (let i = 0; i < topSize; i++) {
      const user = message.guild.members.get(topList[i]);
      if (user) {
        msg += `  **${rangs[i]}. ${(!user || !user.nickname) ? user.user.username : user.nickname}** ${tools.separateThousandth(copyList[topList[i]])}:cookie:\n`;
      }
    }

    message.reply(`**печеньковые богачи:** ${msg}`);
  },
};
