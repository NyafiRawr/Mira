import { client } from '../client';
import { log } from '../logger';

/**
 * Обработчик для события onReady
 */
export default async () => {
  log.info(`Бот ${client.user.tag} на связи`);
  log.info('Пользователей', client.users.size);
  log.info(
    'Список серверов',
    client.guilds.map(g => g.name)
  );

  log.debug(`Слушаем события из Discord`);
  client.user.setActivity('Новый год!');
};
