import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const leave = async (message: Message, args: string[]) => {
    const relation = await gildrelations.getOne(
        message.guild!.id,
        message.author.id
    );
    if (relation == null) {
        throw new Error('у тебя нет гильдии, чтобы покидать её.');
    }

    const gild = (await gilds.getOne(relation.gildId))!;
    if (gild.ownerId == message.author.id) {
        await gilds.remove(message.guild!.id, gild); // Каскадное удаление
        await message.reply(`твоя гильдия распущена.`);
        return;
    } else {
        await relation.destroy();

        const channels: { texts: string[]; voices: string[] } =
            gild.channels === null
                ? { texts: [], voices: [] }
                : JSON.parse(gild.channels);
        const channelsList = channels.texts.concat(channels.voices);

        try {
            channelsList.map(async (channelId: string) => {
                const channel = message.guild!.channels.resolve(channelId);
                await channel?.updateOverwrite(message.author.id, {
                    VIEW_CHANNEL: false,
                });
            });
        } catch {
            message.reply(
                'не удалось забрать права доступа к каналам гильдии, возможно у меня нет прав.'
            );
        }

        await message.reply(`ты покинул гильдию.`);
        return;
    }
};
