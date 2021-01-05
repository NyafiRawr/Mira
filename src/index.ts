import { client } from './client';
import config from './config';
import { log } from './logger';
import { commands } from './commands';
import { awardOfBump } from './modules/bumps';
import { onAirInPresence, onAirInVoice } from './modules/airs';
import { happyBirthday } from './modules/congratulations';
import { rescueVoiceTime, recVoiceTime } from './modules/voices';
import { reactionRoleAdd, reactionRoleRemove } from './modules/rrs';
import * as users from './modules/users';

client.on('disconnect', () => log.error('Соединение оборвалось!'));
client.on('guildCreate', (guild) =>
  log.info(
    `Меня добавили в: ${guild.name} [GID: ${guild.id}] Участники: ${guild.memberCount}`
  )
);
client.on('guildDelete', (guild) =>
  log.info(
    `Меня удалили из: ${guild.name} [GID: ${guild.id}] Участников: ${guild.memberCount}`
  )
);
client.on('guildMemberAdd', async (guildMember) => {
  // Записываем время входа
  await users.get(guildMember.guild.id, guildMember.user.id);
});

client.once('ready', async () => {
  await client.user?.setPresence({
    activity: {
      name: `${config.discord.prefix}help`,
      type: 'WATCHING',
    },
    status: 'online',
  });

  await happyBirthday(); // Вызывает сама себя каждые сутки
});

client.on('ready', async () => {
  log.info(`Бот ${client.user?.tag} на связи!`);

  await rescueVoiceTime();
});

client.on('message', async (message) => await commands(message));
client.on('message', async (message) => await awardOfBump(message));

client.on('voiceStateUpdate', async (oldState, newState) => {
  await onAirInVoice(oldState, newState);
  await recVoiceTime(oldState, newState);
});
client.on(
  'presenceUpdate',
  async (oldPresence, newPresence) =>
    await onAirInPresence(oldPresence, newPresence)
);

client.on('messageReactionAdd', async (messageReaction, user) => {
  await reactionRoleAdd(messageReaction, user);
});
client.on('messageReactionRemove', async (messageReaction, user) => {
  await reactionRoleRemove(messageReaction, user);
});

client.login(config.discord.token);
