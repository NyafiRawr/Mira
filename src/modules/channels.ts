import {
  Client,
  Guild,
  GuildMember,
  Snowflake,
  User,
  VoiceChannel,
  VoiceState,
} from 'discord.js';
import * as vars from './vars';
import { log } from '../logger';

// todo: read from vars
const TEMP_VOICE_PREFIX = '[TEMP]';

export enum VoiceChannelState {
  LOCK,
  UNLOCK,
}

interface CustomVoiceChannel {
  owner: User;
  voice: VoiceChannel;
}

const channels = new Map<Snowflake, CustomVoiceChannel>();

/**
 * Получение канала в котором пользователь является админом
 * @param author
 */
const getOwnChannel = (author: User): CustomVoiceChannel => {
  const chan = Array.from(channels.values()).find(
    (value) => value.owner === author
  );
  if (!chan) {
    throw new Error('Нет активных каналов где ты владелец!');
  }

  return chan;
};

/**
 * Инициализация при запуске
 * проходимся по всем подключенным гильдиям и удаляем мертвые каналы
 * @param client {Client} активный клиент дискорда
 */
export const init = async (client: Client) => {
  return Promise.all(client.guilds.cache.map((v) => clearDeadChannels(v)));
};

/**
 * Добавляет возможность войти в голосовой канал даже если он закрыт
 * @param owner
 * @param newbie
 */
export const invite = async (
  owner: User,
  newbie: GuildMember
): Promise<CustomVoiceChannel> => {
  const chan = getOwnChannel(owner);

  const permissions = chan.voice.permissionsFor(newbie);
  if (permissions?.has(['CONNECT', 'CONNECT'])) {
    throw new Error(`у ${newbie.displayName} уже есть приглашение`);
  }

  await chan.voice.updateOverwrite(newbie, {
    CONNECT: true,
    SPEAK: true,
  });

  return chan;
};

export const kick = async (
  owner: User,
  member: GuildMember
): Promise<CustomVoiceChannel> => {
  const chan = getOwnChannel(owner);

  const permissions = chan.voice.permissionsFor(member);
  if (permissions?.has(['CONNECT', 'CONNECT'])) {
    throw new Error(`у ${member.displayName} уже есть приглашение`);
  }

  await chan.voice.updateOverwrite(member, {
    CONNECT: false,
    SPEAK: false,
  });

  return chan;
};

/**
 * Блокирует/разблокирует канал
 * @param author
 * @param state
 */
export const changeState = async (
  author: User,
  state: VoiceChannelState
): Promise<CustomVoiceChannel> => {
  const chan = Array.from(channels.values()).find(
    (value) => value.owner === author
  );
  if (!chan) {
    throw new Error('Нет активных каналов где ты владелец!');
  }

  await chan.voice.updateOverwrite(chan.voice.guild.roles.everyone, {
    VIEW_CHANNEL: state === VoiceChannelState.UNLOCK,
  });

  return chan;
};

/**
 * Добавляет ограничение на максимальное кол-во пользователей в канале
 * @param author
 * @param limit
 */
export const setLimit = async (
  author: User,
  limit: number
): Promise<CustomVoiceChannel> => {
  const chan = getOwnChannel(author);
  await chan.voice.setUserLimit(limit);

  return chan;
};

/**
 * Проходимся по каналам в гильдии и удаляем свои мертые каналы
 * необходимо выполнять на старте приложения
 * @param guild
 */
export const clearDeadChannels = async (guild: Guild) => {
  guild.channels.cache
    .filter((channel) => channel.type === 'voice')
    .filter((channel) => channel.name.startsWith(TEMP_VOICE_PREFIX))
    .map((channel) => channel)
    .forEach((channel) => channel.delete());
};

/**
 * "Безопасное" удаление канала
 * @param channel
 */
export const deleteChannel = async (channel: VoiceChannel) => {
  if (!channels.has(channel.id) || channel.members.size !== 0) {
    return;
  }

  channels.delete(channel.id);
  await channel.delete('Нет активных пользователей');
};

/**
 * Создание и настройка канала
 * @param channel канал родитель (например канал в который нужно войти что бы создался временный)
 * @param user
 */
export const creatChannel = async (
  channel: VoiceChannel,
  user: GuildMember
): Promise<CustomVoiceChannel | null> => {
  const guild = channel.guild;

  const variable = await vars.getOne(guild.id, 'temp_channels_root_id');
  if (!variable) {
    log.trace(`не указана переменная temp_channels_root_id у "${guild.name}"`);
    return null;
  }

  const allowedChannels = JSON.parse(variable.value || '[]');

  if (!allowedChannels.includes(channel.id)) {
    log.trace(
      `канал не указан переменной temp_channels_root_id у "${guild.name}"`
    );
    return null;
  }

  const chan = await guild.channels.create(
    `${TEMP_VOICE_PREFIX} ${user.displayName}`,
    {
      type: 'voice',
      parent: channel.parent || undefined,
      permissionOverwrites: [
        {
          id: user.id,
          allow: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
        },
        {
          id: guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
      ],
    }
  );

  const customChan = {
    owner: user.user,
    voice: chan,
  };
  channels.set(chan.id, customChan);
  await user.voice.setChannel(chan);

  return customChan;
};

export const onDisconnect = async (
  oldState: VoiceState,
  newState: VoiceState
) => {
  if (!oldState.channel || newState.channelID === oldState.channelID) {
    return;
  }

  try {
    await deleteChannel(oldState.channel);
  } catch (e) {
    log.error('ошибка при удалении чата');
  }
};

export const onConnect = async (_: unknown, newState: VoiceState) => {
  if (
    !newState ||
    !newState.member ||
    !newState.channel ||
    !newState.channel.parent
  ) {
    return;
  }

  try {
    await creatChannel(newState.channel, newState.member);
  } catch (e) {
    log.error('ошибка при создании чата');
  }
};
