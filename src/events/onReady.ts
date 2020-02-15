import { client } from '../client';
import { log } from '../logger';

/**
 * Обработчик для события onReady
 */
export default async () => {
  log.info(`Бот ${client.user.tag} на связи!`);
  log.info('Обнаружено пользователей:', client.users.size);
  log.info(
    'Сервера:',
    client.guilds.map(g => g.name)
  );

  log.debug(`Слушаем события из Discord`);
  client.user.setActivity('osu!');
};
