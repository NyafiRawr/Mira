import { Collection, Snowflake } from 'discord.js';

const coolds = new Collection<Snowflake, number>();

export default {
    // Возвращает секунды до отката
    get: (guildId: string, userId: string, commandName: string): number => {
        const cooldown = coolds.get(`${guildId}_${userId}_${commandName}`);
        return cooldown != undefined && cooldown > Date.now()
            ? (cooldown - Date.now()) / 1000
            : 0;
    },
    set: (
        guildId: string,
        userId: string,
        commandName: string,
        seconds: number
    ): void => {
        coolds.set(
            `${guildId}_${userId}_${commandName}`,
            Date.now() + seconds * 1000
        );
    },
};
