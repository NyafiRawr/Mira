/**
 * Обработчик при подключении нового сервера
 */
export default async (guild) => {
  console.log(`Новое подключение: ${guild.name} (id: ${guild.id}). Участники: ${guild.memberCount}`);
};
