/**
 * Обработчик при подключении нового сервера
 */
export default async (guild) => {
  console.log(`Отключен сервер: ${guild.name} (id: ${guild.id}). Участников: ${guild.memberCount}`);
};
