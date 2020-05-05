import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as warns from '../../modules/warnings';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Сделать предупреждение, чтобы не нарушал правил',
  aliases: ['warn'],
  usage: '@кому [почему]',
  guild: true,
  hide: true,
  cooldown: 0.5,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно право управлять сообщениями!');
    }

    const victim = message.mentions.members.first();
    if (!victim)
      throw new CustomError(
        'пожалуйста, укажите кому нужно сделать предупреждение при вызове команды!'
      );

    let reason = args.slice(1).join(' ').trim();
    if (!reason.length) reason = 'Не указана';

    await warns.set(message.guild.id, victim.id, reason);
    return message.channel.send({
      'embed': {
        'author': {
          'name': `${victim.user.username + '#' + victim.user.discriminator} получает предупреждение`,
          'icon_url': victim.user.avatarURL
        },
        'description': `**Причина:** ${reason}`,
      }
    });
  },
};
