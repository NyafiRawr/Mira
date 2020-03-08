import { client } from './../client';
// Кэширование добавления и удаления реакций
export default (packet: any) => {
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t))
    return;
  const channel: any = client.channels.get(packet.d.channel_id);
  if (channel.messages.has(packet.d.message_id)) return; // Если сообщение уже в кэше
  channel.fetchMessage(packet.d.message_id).then((message: any) => {
    const emoji = packet.d.emoji.id
      ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
      : packet.d.emoji.name;
    const reaction = message.reactions.get(emoji);
    if (reaction)
      reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
    if (packet.t === 'MESSAGE_REACTION_ADD') {
      client.emit(
        'messageReactionAdd',
        reaction,
        client.users.get(packet.d.user_id)
      );
    }
    if (packet.t === 'MESSAGE_REACTION_REMOVE') {
      client.emit(
        'messageReactionRemove',
        reaction,
        client.users.get(packet.d.user_id)
      );
    }
  });
};
