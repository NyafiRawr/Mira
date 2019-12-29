import client from '../client';
import config from '../config';

/**
 * Обработчик для события onReady
 */
export default async () => {
  console.log(`* ${client.user.tag} на связи! Подключения: ${client.guilds.size} Всего пользователей: ${client.users.size}`);
  console.log('Подключенные сервера:');
  client.guilds
    .forEach((g) => console.log(' ', g.name));
  console.log('----------------------------');

  client.user.setActivity(`${config.bot.prefix}help`);
};
