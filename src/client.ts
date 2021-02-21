import { Client } from 'discord.js';

enum PrivilegedIntents {
    GUILD_PRESENCES = 'GUILD_PRESENCES',
    GUILD_MEMBERS = 'GUILD_MEMBERS',
}

export const client = new Client({
    // Кэширование вещей существовавших до запуска
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
    ws: {
        // События, которые отлавливаем (остальные игнорируются)
        intents: [
            'GUILDS',
            'GUILD_BANS',
            // 'GUILD_EMOJIS',
            // 'GUILD_INTEGRATIONS',
            // 'GUILD_WEBHOOKS',
            'GUILD_INVITES',
            'GUILD_VOICE_STATES',
            'GUILD_MESSAGES',
            'GUILD_MESSAGE_REACTIONS',
            // 'GUILD_MESSAGE_TYPING',
            // 'DIRECT_MESSAGES',
            // 'DIRECT_MESSAGE_REACTIONS',
            // 'DIRECT_MESSAGE_TYPING',
            PrivilegedIntents.GUILD_PRESENCES,
            PrivilegedIntents.GUILD_MEMBERS,
        ],
    },
    fetchAllMembers: false,
});
