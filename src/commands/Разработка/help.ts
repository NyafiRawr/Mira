import { Message, MessageEmbed } from 'discord.js';
import { CommandFile, commandsAliases, commandsList } from './../../commands';
import { secondsFormattedHMS, toTitle } from '../../utils';
import config from '../../config';
import * as access from '../../modules/access';

// Команды по группам
const spells: { [key: string]: CommandFile[] } = {};
async function rememberSpells(): Promise<void> {
  commandsList.map((command) => {
    if (spells[command.group] == undefined) {
      spells[command.group] = [command];
    } else {
      spells[command.group].push(command);
    }
  });
}

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Список заклинаний',
  aliases: ['spells', 'commands'],
  usage: '[имя/категория]',
  cooldown: {
    seconds: 3,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (Object.keys(spells).length === 0) {
      await rememberSpells();
    }

    const embed = new MessageEmbed().setColor(config.colors.help);

    const spokenWord = args.shift();

    if (spokenWord == undefined) {
      // Все категории с перечислением команд (без описания)
      for await (const groupName of Object.keys(spells)) {
        const spellsAllow: string[] = [];
        for await (const spell of spells[groupName]) {
          const isDeny = await access.check(
            message.guild!.id,
            message.channel.id,
            spell.name
          );
          if (isDeny === false) {
            spellsAllow.push(spell.name);
          }
        }
        embed.addField(
          groupName,
          spellsAllow.map((name) => `\`${name}\``).join(', ') ||
            `Команды категории отключены администратором сервера (\`${config.discord.prefix}access\`)`
        );
      }
      embed
        .setTitle('Список заклинаний :P')
        .addField(
          'Узнать больше',
          `О категории: \`${config.discord.prefix}help имя_категории\`` +
            `\nО команде: \`${config.discord.prefix}help имя_команды\``
        );
    } else if (spells[toTitle(spokenWord)] != undefined) {
      // Отображение списка команд из категории groupName
      const groupName = toTitle(spokenWord);
      embed
        .setAuthor('Заклинания категории')
        .setTitle(groupName)
        .setDescription(
          spells[groupName]
            .map(
              (spell) =>
                `\`${config.discord.prefix}${spell.name} ${
                  spell.usage || ''
                }\` - ${spell.description}`
            )
            .join('\n')
        )
        .setFooter('Параметры обёрнутые в <> - обязательны, а в [] - нет');
    } else {
      // Подробная информация о команде spellName
      const spellName = spokenWord.toLowerCase();
      const spell =
        commandsList.get(spellName) || commandsAliases.get(spellName);
      if (spell == undefined) {
        message.reply(
          `ни группа ни заклинание с названием \`${spokenWord}\` не найдены.`
        );
        return;
      }

      embed
        .setAuthor('О заклинании')
        .setTitle(
          spell.aliases
            ? `${spell.name}, ${spell.aliases.join(', ')}`
            : spell.name
        )
        .setDescription(spell.description || 'Описание отсутствует');

      if (spell.usage) {
        embed
          .addField(
            '**Использовать так**',
            `${config.discord.prefix}${spell.name} ${spell.usage}`,
            false
          )
          .setFooter(
            'Параметры обёрнутые в <> - обязательны, а в [] - нет\n\n'
          );
      }

      if (spell.group) {
        embed.addField('**Категория**', spell.group, true);
      }

      embed.addField(
        '**Откат**',
        secondsFormattedHMS(
          spell.cooldown?.seconds || config.defaultCooldown.seconds
        ),
        true
      );
    }

    message.channel.send(embed);
  },
};
