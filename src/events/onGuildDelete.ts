import { Guild } from 'discord.js';

/**
 * Обработчик при подключении нового сервера
 */
export default async (guild: Guild) => {
  console.log(`Отключен сервер: ${guild.name} (id: ${guild.id}). Участников: ${guild.memberCount}`);
};
