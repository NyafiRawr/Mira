const Discord = require('discord.js');

const emotes = require('../../modules/emotes.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'трай получить роль через реакцию',
  aliases: undefined,
  usage: undefined,
  guild: true,
  hide: false,
  permissions: ['MANAGE_ROLES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args) {

    const role = message.mentions.roles.first();  //Роль
    const emote = args[1];                        //Эмодзи
    const msgId = args[2];                        //Сообщение для привязки
    
    //Поиск нужного сообщения
    const msgFind = await message.channel.fetchMessage(msgId); 
    ///А асинхронном ваще так пользуются ?
    if (msgFind) {

      ///Ничего другого для того чтобы отличить серверное эмодзи от не серверного я не придумал
      let p1 = emote.lastIndexOf(`:`) + 1;                  
      let p2 = emote.indexOf(`>`);
        let emojiId = emote.slice(p1,p2);

      if ( p1 == 0) {     ///Если эмозди дефолтное
        emotes.set(message.channel.id, msgId, emote, role.id);      
        msgFind.react(emote);
      } else {            ///Если эмозди серверное
        emotes.set(message.channel.id, msgId, emojiId, role.id);
        msgFind.react(emojiId);
      }
    } 

  },
};
