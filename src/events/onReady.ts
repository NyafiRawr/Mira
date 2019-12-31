import client from '../client';

/**
 * Обработчик для события onReady
 */
export default async () => {
  console.log(`* ${client.user.tag} на связи! Пользователи: ${client.users.size}`);
  console.log(`Подключенные сервера (${client.guilds.size}):`);
  client.guilds
    .forEach((g) => console.log(' ', g.name));
  console.log('----------------------------');

  client.user.setActivity('Новый год!');
};
