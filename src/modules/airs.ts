import * as vars from './vars';
import { client } from '../client';
import { log } from '../logger';
import { Guild, GuildMember, Presence, VoiceState } from 'discord.js';

const keyRoleId = 'air_role_id';
export const getRoleId = async (serverId: string): Promise<string | null> => {
    const variable = await vars.getOne(serverId, keyRoleId);
    return variable?.value || null;
};
export const setRoleId = async (
    serverId: string,
    newValue: string | null
): Promise<void> => {
    if (newValue == null) {
        await vars.remove(serverId, keyRoleId);
    } else {
        await vars.set(serverId, keyRoleId, newValue.toString());
    }
};
const keyGames = 'air_games';
export const getGames = async (serverId: string): Promise<string[]> => {
    const variable = await vars.getOne(serverId, keyGames);
    return variable?.value.split(',') || [];
};
export const setGames = async (
    serverId: string,
    newValues: string[] | null
): Promise<void> => {
    if (newValues == null) {
        await vars.remove(serverId, keyGames);
    } else {
        await vars.set(serverId, keyGames, newValues.join(','));
    }
};

export const set = async (
    guild: Guild,
    member: GuildMember
): Promise<boolean> => {
    const roleId = await getRoleId(guild.id);
    if (roleId) {
        const games = await getGames(guild.id);
        if (
            member.presence.activities.some((active) =>
                games.includes(active.name)
            )
        ) {
            try {
                await member.roles.add(roleId);
                return true;
            } catch {
                if (guild.available) {
                    await guild.owner
                        ?.send(
                            `Не удалось выдать эфирную роль на сервере ${guild.name} участнику ${member.displayName}, скорее всего у меня нет прав для выдачи ролей или роль удалена, проверьте через команду \`.air\` на сервере`
                        )
                        .catch(/* ЛС ЗАКРЫТО ИЛИ МЫ ЗАБЛОКИРОВАНЫ */);
                }
            }
        }
    }
    return false;
};

export const remove = async (
    guild: Guild,
    member: GuildMember
): Promise<void> => {
    const roleId = await getRoleId(guild.id);
    if (roleId) {
        await member.roles.remove(roleId).catch(() => null);
    }
};

export const onAirInPresence = async (
    oldPresence: Presence | undefined,
    newPresence: Presence
): Promise<void> => {
    if (newPresence.activities.some((act) => act.type == 'STREAMING')) {
        await set(newPresence.guild!, newPresence.member!);
    } else if (oldPresence?.activities.some((act) => act.type == 'STREAMING')) {
        await remove(oldPresence.guild!, oldPresence.member!);
    }
};

export const onAirInVoice = async (
    oldState: VoiceState,
    newState: VoiceState
): Promise<void> => {
    if (newState.channel && newState.streaming) {
        await set(newState.guild!, newState.member!);
    } else if (oldState.streaming) {
        await remove(oldState.guild!, oldState.member!);
    }
};

client.once('ready', async () => {
    log.info('[ЭФИР] Выкидываю всех...');
    const guildsWithAir = await vars.getAll(keyRoleId);
    guildsWithAir.map(async (row) => {
        const guild = client.guilds.resolve(row.serverId);
        if (guild == null) {
            return setRoleId(row.serverId, null);
        }
        const roleId = row.value;

        guild.members.cache.map(async (member) => {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }
        });
    });
    log.info('[ЭФИР] Чисто');
});
