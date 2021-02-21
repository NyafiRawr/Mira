import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import * as punches from '../../../modules/mutes';

export const remove = async (message: Message, args: string[]) => {
    if (message.mentions.members?.size === 0) {
        throw new Error(
            'нужно упомянуть участника, которого нужно изолировать.'
        );
    }
    const victim = message.mentions.members!.first()!;
    args.shift();

    const argId = args.shift();
    if (argId === undefined) {
        throw new Error('не указан срок изоляции.');
    }

    const id = parseInt(argId, 10);
    if (isInteger(id) === false) {
        throw new Error('ID должен быть целочисленными и положительными.');
    } else if (id < 0) {
        throw new Error('такого ID не может быть в списке.');
    }

    const reason = args.join(' ');
    if (reason.trim().length === 0) {
        throw new Error('не указана причина удаления предупреждения.');
    } else if (reason.length > 400) {
        throw new Error(
            'слишком длинная причина удаления предупреждения, максимум 400 символов.'
        );
    }

    const embed = await punches.removeWarn(
        message.guild!.id,
        victim.id,
        reason,
        message.author.id,
        id
    );

    if (embed === null) {
        await message.channel.send('указанный ID не найден.');
    } else {
        await message.channel.send(embed);
    }
};
