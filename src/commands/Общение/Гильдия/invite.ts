import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import config from '../../../config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const invite = async (message: Message, args: string[]) => {
    const relation = await gildrelations.getOne(
        message.guild!.id,
        message.author.id
    );
    if (relation == null) {
        throw new Error('у тебя нет гильдии, чтобы приглашать в неё.');
    }

    const gild = await gilds.getOne(relation.gildId);
    if (gild?.ownerId != message.author.id) {
        throw new Error('приглашать в гильдию может только гильдмастер!');
    }

    const member = message.mentions.members?.first();
    if (member == undefined) {
        throw new Error('ты никого не упомянул.');
    } else if (member.id == message.author.id) {
        throw new Error('приглашать самого себя нельзя.');
    } else if (gilds.invites.has(member.id)) {
        throw new Error(
            `у ${member.displayName} уже есть приглашение, ему нужно отклонить \`${config.discord.prefix}g no\` или принять его \`${config.discord.prefix}g yes\`, прежде, чем ты сможешь послать ему новое.`
        );
    } else if (
        (await gildrelations.getOne(message.guild!.id, member.id)) != null
    ) {
        throw new Error(`у ${member.displayName} уже есть гильдия.`);
    }

    gilds.invites.set(member.id, gild.id);

    await message.channel.send(`*Приглашение для ${member.displayName}*`, {
        embed: {
            color: config.colors.message,
            author: {
                name: 'Приглашение в гильдию',
            },
            title: gild.name,
            description: gild.description || '',
            image: {
                url: gild.imageURL || '',
            },
            thumbnail: {
                url: message.author.avatarURL({ dynamic: true }) || '',
            },
            footer: {
                text: `Принять: ${config.discord.prefix}g yes | Отклонить: ${config.discord.prefix}g no | Срок: до перезагрузки бота`,
            },
        },
    });
};
