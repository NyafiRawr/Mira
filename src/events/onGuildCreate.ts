import { Guild } from 'discord.js';

/**
 * Обработчик при подключении нового сервера
 */
export default async (guild: Guild) => {
  console.log(`Новое подключение: ${guild.name} (id: ${guild.id}). Участники: ${guild.memberCount}`);
};
