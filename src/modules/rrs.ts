import { MessageReaction, PartialUser, User } from 'discord.js';
import ReactionRole from '../models/ReactionRole';

export const getAll = async (serverId: string): Promise<ReactionRole[]> =>
    ReactionRole.findAll({
        where: {
            serverId,
        },
    });

export const getOne = async (
    serverId: string,
    channelId: string,
    messageId: string,
    reaction: string
): Promise<ReactionRole | null> => {
    // findOne меняет кодировку, поэтому сравнение с ним невозможно
    const rows = await ReactionRole.findAll({
        where: {
            serverId,
            channelId,
            messageId,
        },
    });

    return rows.find((rr) => rr.reaction == reaction) || null;
};

export const set = async (
    serverId: string,
    channelId: string,
    messageId: string,
    roleId: string,
    reaction: string
): Promise<ReactionRole> => {
    const rr = await getOne(serverId, channelId, messageId, reaction);

    if (!rr) {
        return ReactionRole.create({
            serverId,
            channelId,
            messageId,
            roleId,
            reaction,
        });
    }

    return rr.update({
        roleId,
    });
};

export const remove = async (
    serverId: string,
    channelId: string,
    messageId: string,
    reaction: string
): Promise<void> => {
    const rr = await getOne(serverId, channelId, messageId, reaction);
    if (rr) {
        return rr.destroy();
    }
};

export const removeById = async (id: number): Promise<void> => {
    const rr = await ReactionRole.findOne({ where: { id } });
    if (rr == null) {
        throw new Error('такого номера нет в базе.');
    }
    return rr.destroy();
};

export const reactionRoleAdd = async (
    messageReaction: MessageReaction,
    user: User | PartialUser
): Promise<void> => {
    if (messageReaction.message.guild == null || user.bot) {
        return; // Игнорируем ЛС и ботов
    }

    const reaction =
        messageReaction.emoji.id == null
            ? messageReaction.emoji.name
            : `<:${messageReaction.emoji.name}:${messageReaction.emoji.id}>`;

    const response = await getOne(
        messageReaction.message.guild.id,
        messageReaction.message.channel.id,
        messageReaction.message.id,
        reaction
    );

    if (response) {
        try {
            await messageReaction.message.guild.members.cache
                .get(user.id)
                ?.roles.add(response.roleId);
        } catch {
            if (messageReaction.message.guild.available) {
                await messageReaction.message.guild.owner
                    ?.send(
                        `Не удалось выдать роль по реакции на сервере ${messageReaction.message.guild.name}, скорее всего у меня нет прав для выдачи ролей или роль удалена.`
                    )
                    .catch(/* ЛС ЗАКРЫТО ИЛИ МЫ ЗАБЛОКИРОВАНЫ */);
            }
        }
    }
};

export const reactionRoleRemove = async (
    messageReaction: MessageReaction,
    user: User | PartialUser
): Promise<void> => {
    if (messageReaction.message.guild == null || user.bot) {
        return; // Игнорируем ЛС и ботов
    }
    const reaction =
        messageReaction.emoji.id == null
            ? messageReaction.emoji.name
            : `<:${messageReaction.emoji.name}:${messageReaction.emoji.id}>`;

    const response = await getOne(
        messageReaction.message.guild.id,
        messageReaction.message.channel.id,
        messageReaction.message.id,
        reaction
    );

    if (response) {
        try {
            await messageReaction.message.guild.members.cache
                .get(user.id)
                ?.roles.remove(response.roleId);
        } catch {
            if (messageReaction.message.guild.available) {
                await messageReaction.message.guild.owner
                    ?.send(
                        `Не удалось снять роль по реакции на сервере ${messageReaction.message.guild.name}, скорее всего у меня нет прав управления ролями.`
                    )
                    .catch(/* ЛС ЗАКРЫТО ИЛИ МЫ ЗАБЛОКИРОВАНЫ */);
            }
        }
    }
};
