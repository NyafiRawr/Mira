import { GuildMember, User, VoiceChannel } from 'discord.js';
import * as vars from './vars';

export enum VoiceChannelState {
  LOCK,
  UNLOCK,
}

interface CustomVoiceChannel {
  state: VoiceChannelState;
  owner: User;
}

const channels = new Map<VoiceChannel, CustomVoiceChannel>();

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

  const allowedChannels = JSON.parse(variable.value);

  if (!allowedChannels.includes(channel.id)) {
    return;
  }

  const chan = await guild.channels.create(`[TEMP] ${user.displayName}`, {
    type: 'voice',
    parent: channel.parent || undefined,
    permissionOverwrites: [
      {
        id: user.id,
        deny: ['VIEW_CHANNEL'],
      },
    ],
  });

  channels.set(chan, {
    owner: user.user,
    state: VoiceChannelState.LOCK,
  });
  await user.voice.setChannel(chan);
};
