import Emoji from '../models/emoji';

export const get = async <T = Emoji>(
  channelId: string,
  messageId: string,
  emojiId: string
): Promise<T> => {
  const role = await Emoji.findOne({
    where: {
      channelId,
      messageId,
      emojiId,
    },
  });
  return role as any;
};

export const set = async (
  channelId: string,
  messageId: string,
  emojiId: string,
  roleId: string
) => {
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
