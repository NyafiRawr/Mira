import {
  Client,
  Guild,
  GuildMember,
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
  state: VoiceChannelState;
  owner: User;
}

const channels = new Map<VoiceChannel, CustomVoiceChannel>();

export const init = async (client: Client) => {
  return Promise.all(client.guilds.cache.map((v) => clearDeadChannels(v)));
};

export const clearDeadChannels = async (guild: Guild) => {
  guild.channels.cache
    .filter((channel) => channel.type === 'voice')
    .filter((channel) => channel.name.startsWith(TEMP_VOICE_PREFIX))
    .map((channel) => channel)
    .forEach((channel) => channel.delete());
};

export const deleteChannel = async (channel: VoiceChannel) => {
  if (!channels.has(channel) || channel.members.size !== 0) {
    return;
  }

  channels.delete(channel);
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
          deny: ['VIEW_CHANNEL'],
        },
      ],
    }
  );

  channels.set(chan, {
    owner: user.user,
    state: VoiceChannelState.LOCK,
  });
  await user.voice.setChannel(chan);
};

export const onDisconnect = async (
  oldState: VoiceState,
  newState: VoiceState
) => {
  if (!oldState.channel || newState.channelID !== null) {
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
