import {
  Message,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import config from '../../../config';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { info } from './info';
import { separateThousandth } from '../../../utils';

export const buy = async (message: Message, args: string[]) => {
  const relation = await gildrelations.getOne(
    message.guild!.id,
    message.author.id
  );
  if (relation == null) {
    throw new Error('у тебя нет гильдии, чтобы приобретать каналы для неё.');
  }
  const gild = await gilds.getOne(message.guild!.id, relation.gildId);
  if (gild?.ownerId != message.author.id) {
    throw new Error('покупать каналы для гильдии может только гильдмастер!');
  }

  const target = args.shift();

  const name = args.join(' ').trim();
  const arr = name.match(config.gilds.patternClearName);
  if (arr?.length != 1) {
    throw new Error(
      'имя канала не указано или в нём ошибка, можно использовать только цифры и буквы на русском и английском языке, минимальная длина имени гильдии 3 символа, а максимальная 30 символов!'
    );
  } else if (name.length > config.gilds.maxSizeName) {
    throw new Error(
      `превышена максимальная длина имени канала: ${name.length}/${config.gilds.maxSizeName} символов.`
    );
  }

  let categoryId = await gilds.creationCategoryId(message.guild!.id);
  if (categoryId == null) {
    const category = await message
      .guild!.channels.create('Гильдия', { type: 'category' })
      .catch(() => {
        throw new Error(
          'мне нужно глобальное право управления каналами, чтобы создать категорию для размещения гильдий!'
        );
      });
    categoryId = category.id;
    await gilds.creationCategoryId(message.guild!.id, categoryId);
  }

  const defaultPermissions = [
    {
      id: message.guild!.roles.everyone.id,
      deny: ['VIEW_CHANNEL'],
      allow: ['STREAM', 'CREATE_INSTANT_INVITE', 'MENTION_EVERYONE'],
    },
    {
      id: message.client!.user!.id,
      allow: ['VIEW_CHANNEL'],
    },
    {
      id: message.author.id,
      allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS'],
    },
  ] as OverwriteResolvable[];

  let channels: { texts: string[]; voices: string[] } = {
    texts: [],
    voices: [],
  };
  if (gild.channels != null) {
    channels = JSON.parse(gild.channels);
  }

  let channel: TextChannel | VoiceChannel;
  let price;

  switch (target) {
    case 'text': {
      price = await gilds.priceBuyChannelText(message.guild!.id);
      if (gild.balance < price) {
        throw new Error(
          `не хватает: ${separateThousandth(
            (price - gild.balance).toString()
          )}/${separateThousandth(price.toString())}:cookie:`
        );
      }

      channel = await message.guild!.channels.create(name, {
        type: 'text',
        parent: categoryId,
        permissionOverwrites: defaultPermissions,
      });
      channels.texts.push(channel.id);

      break;
    }
    case 'voice': {
      price = await gilds.priceBuyChannelVoice(message.guild!.id);
      if (gild.balance < price) {
        throw new Error(
          `не хватает: ${separateThousandth(
            (price - gild.balance).toString()
          )}/${separateThousandth(price.toString())}:cookie:`
        );
      }

      channel = await message.guild!.channels.create(name, {
        type: 'voice',
        parent: categoryId,
        permissionOverwrites: defaultPermissions,
      });
      channels.voices.push(channel.id);

      break;
    }
    default: {
      throw new Error(`\`${target}\` нет в списке для покупки.`);
    }
  }

  await gild.update({
    balance: gild.balance - price,
    channels: JSON.stringify(channels),
  });

  const members = await gildrelations.getAll(message.guild!.id, gild.gildId);
  members.map(async (relation) => {
    try {
      await channel!.updateOverwrite(relation.userId, { VIEW_CHANNEL: true });
    } catch {
      // Юзер не является участником сервера - игнорируем
    }
  });

  await info(message, [gild.gildId.toString()]);
};
