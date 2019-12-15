import Discord from 'discord.js';

/**
 * Своя реализация ошибки с возможностью пробросить ответ для конечного пользователя
 */
export default class CustomError extends Error {
  /**
   * @constructor
   * @param {String} reply сообщения которое будет отправлено пользователю
   * @returns {CustomError}
   */
  constructor(reply) {
    super(reply)

    // на случай когда не указали ответ
    this.reply = reply || null;
  }

  /**
   * Вызывается для отправки сообщения пользователю
   * @param {Discord.Message} message сообщение
   * @returns {Promise<void>}
   */
  async send(message) {
    await message.reply(this.reply || 'при вызове команды произошла ошибка ;(');
  }
}