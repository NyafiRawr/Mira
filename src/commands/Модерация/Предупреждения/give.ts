import { Message } from 'discord.js';
import config from '../../../config';
import * as punches from '../../../modules/mutes';

export const give = async (message: Message, args: string[]) => {
    const victim = message.mentions.members?.first();
    if (victim === undefined) {
        throw new Error(
            'не упомянут участник, которому нужно выдать предупреждение.'
        );
    }
    args.shift();

    const reason = args.join(' ');
    if (reason.trim().length === 0) {
        throw new Error('нужно указать причину выдачи предупреждения.');
    } else if (reason.length > 400) {
        throw new Error('слишком длинная причина, максимум 400 символов.');
    }

    const warnEmbed = await punches.setWarn(
        message.guild!.id,
        victim.id,
        reason,
        message.author.id,
        message.channel.toString()
    );
    await message.channel.send(warnEmbed);

    const muteTerm = await punches.checkTermForMute(
        message.guild!.id,
        victim.id
    );
    if (muteTerm !== null) {
        const roleId = await punches.getMuteRoleId(message.guild!.id);
        if (roleId !== null) {
            await victim.roles.add(roleId);
            const muteEmbed = await punches.setMute(
                message.guild!.id,
                victim.id,
                `Получено ${muteTerm.countWarnings} предупреждений за ${muteTerm.forDays} дней`,
                message.client.user?.id || config.author.discord.id,
                message.channel.toString(),
                muteTerm.timestamp
            );
            await message.channel.send(victim, muteEmbed);
        }
    }
};
