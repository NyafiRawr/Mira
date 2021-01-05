import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const kick = async (message: Message, args: string[]) => {
  const relation = await gildrelations.getOne(
    message.guild!.id,
    message.author.id
  );
  if (relation == null) {
    throw new Error('у тебя нет гильдии, чтобы исключать из неё кого-нибудь.');
  }

  const gild = await gilds.getOne(message.guild!.id, relation.gildId);
  if (gild?.ownerId != message.author.id) {
    throw new Error('исключать из гильдии может только гильдмастер!');
  }

  const member = message.mentions.members?.first();
  if (member == undefined) {
    throw new Error('ты никого не упомянул.');
  } else if (member.id == message.author.id) {
    throw new Error('самого себя кикнуть нельзя.');
  }

  await gildrelations.remove(message.guild!.id, member.id);

  if (gild?.channels != null) {
    const channels = JSON.parse(gild.channels);
    const channelIds = [...channels.texts, ...channels.voices];
    try {
      channelIds.map(async (channelId: string) => {
        const channel = message.guild?.channels.resolve(channelId);
        await channel?.updateOverwrite(member, { VIEW_CHANNEL: false });
      });
    } catch {
      message.reply(
        'не удалось отобрать права доступа к каналам гильдии, возможно у меня нет прав.'
      );
    }
  }

  return message.reply(`упомянутый участник исключен из гильдии.`);
};
