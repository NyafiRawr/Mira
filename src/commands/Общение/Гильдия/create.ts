import { Message } from 'discord.js';
import config from '../../../config';
import * as economy from '../../../modules/economy';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { info } from './info';
import { toTitle } from '../../../utils';

export const create = async (message: Message, args: string[]) => {
  const name = args.join(' ').trim();
  const arr = name.match(config.gilds.patternClearName);
  if (arr?.length != 1) {
    throw new Error(
      'имя гильдии не указано или в нём ошибка, можно использовать только цифры и буквы на русском и английском языке, минимальная длина имени гильдии 3 символа, а максимальная 30 символов!'
    );
  } else if (name.length > config.gilds.maxSizeName) {
    throw new Error(
      `превышена максимальная длина имени гильдии: ${name.length}/${config.gilds.maxSizeName} символов.`
    );
  }

  if (
    (await gildrelations.getOne(message.guild!.id, message.author.id)) != null
  ) {
    throw new Error(`у тебя уже есть гильдия.`);
  }

  await economy.setBalance(
    message.guild!.id,
    message.author.id,
    -(await gilds.priceCreate(message.guild!.id))
  );

  const gild = await gilds.create(
    message.guild!.id,
    message.author.id,
    toTitle(name)
  );

  await gildrelations.create(message.guild!.id, message.author.id, gild.gildId);

  if (gilds.invites.has(message.author.id)) {
    gilds.invites.delete(message.author.id);
  }

  await info(message, [gild.gildId.toString()]);
};
