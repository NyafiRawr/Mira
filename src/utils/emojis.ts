import Emoji from '../models/emoji';

export const get = async (
  channelId: string,
  messageId: string,
  emojiId: string
): Promise<Emoji | null> =>
  Emoji.findOne({
    where: {
      channelId,
      messageId,
      emojiId,
    },
  });

export const set = async (
  channelId: string,
  messageId: string,
  emojiId: string,
  roleId: string
): Promise<Emoji> => {
  const role = await get(channelId, messageId, emojiId);

  if (role != null) {
    return role.update({
      roleId,
    });
  }

  return Emoji.create({
    channelId,
    messageId,
    emojiId,
    roleId,
  });
};
