module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Проверка связи',
  aliases: ['pinguin'],
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message /* , args, CooldownReset */) {
    let target = message.channel;

    if (message.guild === undefined) {
      target = message.author;
    }

    target.send('Обратная связь..').then((msg) => {
      msg.edit(`Задержка: ${msg.createdTimestamp - message.createdTimestamp} мс, API: ${Math.round(message.client.ping)} мс :ping_pong: ${message.author}`);
    });
  },
};
