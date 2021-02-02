import { client } from './client';
import config from './config';
import { log } from './logger';
import { commands } from './commands';
import { awardOfBump } from './modules/bumps';
import { onAirInPresence, onAirInVoice } from './modules/airs';
import { happyBirthday } from './modules/congratulations';
import { recVoiceTime, rescueVoiceTime } from './modules/voices';
import { reactionRoleAdd, reactionRoleRemove } from './modules/rrs';
import { checkBadWords, checkReleases, returnMuteRole } from './modules/mutes';
import {
  logBanAdd,
  logBanRemove,
  logKick,
  logMessageBulk,
  logMessageDelete,
  logMessageUpdate,
} from './modules/logs';
import * as users from './modules/users';
import * as channels from './modules/channels';

client.on('disconnect', () => log.error('Соединение оборвалось!'));

client.on('warn', log.warn);

client.on('guildCreate', (guild) =>
  log.info(
    `Меня добавили в: ${guild.name} [GID: ${guild.id}]. Владелец: ${guild.owner}. Участники: ${guild.memberCount}`
  )
);

client.on('guildDelete', (guild) =>
  log.info(
    `Меня удалили из: ${guild.name} [GID: ${guild.id}]. Владелец: ${guild.owner}. Участники: ${guild.memberCount}`
  )
);

// Один раз при запуске
client.once('ready', async () => {
  await client.user?.setPresence({
    activity: {
      name: `${config.discord.prefix}help`,
      type: 'WATCHING',
    },
    status: 'online',
  });

  await happyBirthday(); // Вызывает сам себя
  await checkReleases(); // Вызывает сам себя
  await channels.init(client);
});

// При каждом восстановлении соединения
client.on('ready', async () => {
  log.info(`Бот ${client.user?.tag} на связи!`);

  await rescueVoiceTime(); // Вычислить время проведенное участниками в голосовых чатах
});

client.on('message', async (message) => await commands(message));
client.on('message', async (message) => await awardOfBump(message));
client.on('message', async (message) => await checkBadWords(message));

//#region Streams
client.on('voiceStateUpdate', channels.onConnect);
client.on('voiceStateUpdate', channels.onDisconnect);

client.on('voiceStateUpdate', async (oldState, newState) => {
  await onAirInVoice(oldState, newState);
  await recVoiceTime(oldState, newState);
});

client.on(
  'presenceUpdate',
  async (oldPresence, newPresence) =>
    await onAirInPresence(oldPresence, newPresence)
);

//#endregion

//#region Reactions

client.on('messageReactionAdd', async (messageReaction, user) => {
  await reactionRoleAdd(messageReaction, user);
});

client.on('messageReactionRemove', async (messageReaction, user) => {
  await reactionRoleRemove(messageReaction, user);
});

//#endregion

//#region Logs

client.on('guildMemberAdd', async (guildMember) => {
  await users.get(guildMember.guild.id, guildMember.user.id); // Записываем время входа
  await returnMuteRole(guildMember);
});

client.on('guildMemberRemove', async (guildMember) => {
  await logKick(guildMember);
});

client.on('guildBanAdd', async (guild, user) => await logBanAdd(guild, user));

client.on(
  'guildBanRemove',
  async (guild, user) => await logBanRemove(guild, user)
);

client.on('messageDelete', async (message) => await logMessageDelete(message));

client.on(
  'messageDeleteBulk',
  async (message) => await logMessageBulk(message)
);

client.on(
  'messageUpdate',
  async (messageOld, messageNew) =>
    await logMessageUpdate(messageOld, messageNew)
);

//#endregion

client.login(config.discord.token);
