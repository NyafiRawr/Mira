import { Message } from 'discord.js';
import { isInteger } from 'lodash';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Удаление сообщений',
  aliases: ['remove', 'clear', 'prune', 'delete'],
  usage: '[@писатель] <кол-во>',
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const channel = message.guild!.channels.resolve(message.channel.id);
    if (!channel?.permissionsFor(message.member!)?.has(this.permissions[0])) {
      throw new Error('у тебя нет права управлять сообщениями в этом канале!');
    }
    if (
      !channel?.permissionsFor(message.client.user!)!.has(this.permissions[0])
    ) {
      throw new Error('у меня нет права управлять сообщениями в этом канале!');
    }

    let amount: number;
    const member = message.mentions.members?.first();
    if (member == undefined) {
      amount = parseInt(args[0], 10);
    } else {
      amount = parseInt(args[1], 10);
    }
    if (isInteger(amount) == false) {
      throw new Error('не указано количество.');
    }
    // Удаление больше 100 может вызвать непредсказуемое поведение (заметка по API 2018 года)
    if (amount < 1 || amount > 100) {
      throw new Error('можно удалить только от 1 до 100 сообщений за раз.');
    }

    let messages = await message.channel.messages.fetch({ limit: amount });
    if (member) {
      messages = messages.filter((msg) => msg.author.id == member.id);
    }

    messages.map(async (msg) => await msg.delete());

    message.channel
      .send(
        `Удаление **${messages.size}** сообщений(я), ${message.author}\nЗавершение через несколько секунд :alarm_clock:`
      )
      .then(async (msg) => await msg.delete({ timeout: 3000 }));
  },
};
