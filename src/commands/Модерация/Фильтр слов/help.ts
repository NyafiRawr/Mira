import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import * as punches from '../../../modules/mutes';

export const help = async (message: Message) => {
    const words = await punches.getBadWords(message.guild!.id);
    const channels = await punches.getBadChannels(message.guild!.id);

    const embed = new MessageEmbed({
        color: config.colors.message,
        author: {
            name: 'Фильтр плохих слов',
        },
        description:
            'Выдаёт предупреждения за использование слов из списка запрещенных, игнорирует каналы с пометкой NSFW и из списка игнорируемых',
        title: words ? 'Включен' : 'Отключен',
        footer: {
            text: `Для выдачи мута обязательно должны быть настроены: ${config.discord.prefix}warn set И ${config.discord.prefix}mute role`,
        },
    });

    if (words) {
        embed.addField('Запрещенные слова', `||${words.join(', ')}||`, false);
    }

    if (channels) {
        embed.addField(
            'Игнорируемые каналы',
            `${channels.map((id) => `<#${id}>`).join(', ')}`,
            false
        );
    }

    embed.addField(
        'Команды',
        `\`${config.discord.prefix}bw aw <слово, слово, ...>\` - добавить запретное слово` +
            `\n\`${config.discord.prefix}bw rw <слово, слово, ...>\` - удалить слово из списка запретных` +
            `\n\`${config.discord.prefix}bw ac <#канал, #, ...>\` - добавить канал в исключения` +
            `\n\`${config.discord.prefix}bw rc [@]\` - удалить канал из исключений`,
        false
    );

    await message.channel.send(embed);
};
