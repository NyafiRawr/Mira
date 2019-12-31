import client from './client';

import config from './config';
import handler from './events';


// Регистрация добавления реакций
const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
};

// Регистрация событий
client.on('raw', async (event) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!events.hasOwnProperty(event.t)) {
    return;
  }

  const {
    d: data,
  } = event;
  const user = client.users.get(data.user_id);
  const channel = client.channels.get(data.channel_id) || await user.createDM();

  if (channel.messages.has(data.message_id)) {
    return;
  }

  const message = await channel.fetchMessage(data.message_id);

  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);

  client.emit(events[event.t], reaction, user, message);
});

client
  .on('error', console.error)
  .on('warn', console.warn)

  .on('disconnect', handler.onDisconnect)
  .on('reconnecting', handler.onReconnect)
  .on('ready', handler.onReady)
  .on('guildCreate', handler.onGuildCreate)
  .on('guildDelete', handler.onGuildDelete)
  .on('guildMemberAdd', handler.onGuildMemberAdd)
  .on('messageReactionAdd', handler.onMessageReactionAdd)
  .on('messageReactionRemove', handler.onMessageReactionRemove)

  .on('message', handler.onMessage);

client.login(config.bot.token);
