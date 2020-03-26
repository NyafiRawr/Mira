import { client } from '../client';
import { log } from '../logger';
import * as streams from '../modules/streams';

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
    const stream = await streams.get(guild.id);
    if (!!stream?.roleId) {
      const role = guild.roles.get(stream.roleId);
      if (!!role) {
        role.members.map(member => member.removeRole(stream.roleId).catch());
      }
    }
  });
};
