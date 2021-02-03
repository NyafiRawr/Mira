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

// todo: read from vars
const TEMP_VOICE_PREFIX = '[TEMP]';

export enum VoiceChannelState {
  LOCK,
  UNLOCK,
}

interface CustomVoiceChannel {
  owner: User;
  voice: VoiceChannel;
  state: VoiceChannelState;
}

const channels = new Map<Snowflake, CustomVoiceChannel>();

export const init = async (client: Client) => {
  return Promise.all(client.guilds.cache.map((v) => clearDeadChannels(v)));
};

export const changeState = async (author: User, state: VoiceChannelState) => {
  const chan = Array.from(channels.values()).find(
    (value) => value.owner === author
  );
  if (!chan) {
    throw new Error('Нет активных каналов где ты владелец!');
  }

  chan.state = state;
  channels.set(chan.voice.id, chan);
};

export const setLimit = async (author: User, limit: number) => {
  const chan = Array.from(channels.values()).find(
    (value) => value.owner === author && value.voice.members.has(author.id)
  );
  if (!chan) {
    throw new Error('Зайди в канал где ты владелец!');
  }

  await chan.voice.setUserLimit(limit);
};

export const clearDeadChannels = async (guild: Guild) => {
  guild.channels.cache
    .filter((channel) => channel.type === 'voice')
    .filter((channel) => channel.name.startsWith(TEMP_VOICE_PREFIX))
    .map((channel) => channel)
    .forEach((channel) => channel.delete());
};

export const deleteChannel = async (channel: VoiceChannel) => {
  if (!channels.has(channel.id) || channel.members.size !== 0) {
    return;
  }

  channels.delete(channel.id);
  await channel.delete('Нет активных пользователей');
};

export const creatChannel = async (
  channel: VoiceChannel,
  user: GuildMember
) => {
  const guild = channel.guild;

  const variable = await vars.getOne(guild.id, 'temp_channels_root_id');
  if (!variable) {
    return;
  }

  const allowedChannels = JSON.parse(variable.value || '[]');

  if (!allowedChannels.includes(channel.id)) {
    return;
  }

  const chan = await guild.channels.create(
    `${TEMP_VOICE_PREFIX} ${user.displayName}`,
    {
      type: 'voice',
      parent: channel.parent || undefined,
      permissionOverwrites: [
        {
          id: user.id,
          allow: ['CONNECT', 'SPEAK'],
        },
      ],
    }
  );

  channels.set(chan.id, {
    owner: user.user,
    voice: chan,
    state: VoiceChannelState.LOCK,
  });
  await user.voice.setChannel(chan);
};

export const onDisconnect = async (
  oldState: VoiceState,
  newState: VoiceState
) => {
  if (!oldState.channel || newState.channelID === oldState.channelID) {
    return;
  }

  await deleteChannel(oldState.channel);
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

  await creatChannel(newState.channel, newState.member);
};
