import * as Discord from 'discord.js';
import CustomError from '../../utils/customerror';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Удаление сообщений',
  aliases: ['remove', 'clear', 'prune', 'clean', 'delete'],
  usage: '[@писатель] <кол-во>',
  guild: true,
  hide: true,
  cooldown: 1.5,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message, args: string[]) {
    const channel = message.guild.channels.find('id', message.channel.id);

    if (!channel.permissionsFor(message.member)!.has(this.permissions[0])) {
      throw new CustomError('у тебя нет права управлять сообщениями!');
    }

    if (
      !channel.permissionsFor(message.client.user)!.has(this.permissions[0])
    ) {
      throw new CustomError('у меня нет права управлять сообщениями!');
    }

    const user = message.mentions.users.first();
    const val = parseInt(args[0], 0);
    const amount = val || parseInt(args[1], 0);

    if (!amount && !user) {
      throw new CustomError(
        'пожалуйста, укажите участника и количество или только количество!'
      );
    }
    // Удаление больше 100 может вызвать непредсказуемое поведение (заметка 2018 года)
    if (!amount || amount < 1 || amount > 100) {
      throw new CustomError(
        'пожалуйста, укажите число в диапазоне от 1 до 100.'
      );
    }

    message.channel
      .fetchMessages({
        limit: amount,
      })
      .then(messages => {
        let userMsg = messages.array();
        if (user) {
          const filterBy = user ? user.id : message.client.user.id;
          userMsg = messages
            .filter(m => m.author.id === filterBy)
            .array()
            .slice(0, amount);
        }
        message.channel
          .bulkDelete(userMsg)
          .then(msgs => {
            message.channel
              .send(
                `Удалено сообщений: **${msgs.size}** ${message.author}\nСамоуничтожение через несколько секунд :alarm_clock:`
              )
              .then((msg: any) => {
                setTimeout(() => msg.delete(), 3000);
              });
          })
          .catch(error => {
            throw new CustomError(
              `невозможно удалить сообщения, потому что: \n${error}`
            );
          });
      });
  },
};
