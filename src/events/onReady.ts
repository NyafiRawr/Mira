import { client } from '../client';
import { log } from '../logger';
import * as vars from '../modules/vars';

/**
 * Обработчик для события onReady
 */
export default async () => {
  log.info('Обнаружено пользователей:', client.users.size);
  log.info(
    'Сервера:',
    client.guilds.map(g => g.name)
  );
  log.info(`Бот ${client.user.tag} на связи!`);

  client.user.setActivity('osu!');

  // Сервера доступны начиная отсюда производим очистку роли стримера
  client.guilds.forEach(async (guild) => {
    const roleId = await vars.get(guild.id, 'stream_roleId');
    if (!!roleId) {
      const role = guild.roles.get(roleId);
      if (!!role) {
        role.members.map(member => member.removeRole(roleId).catch());
      }
    }
  });
};
