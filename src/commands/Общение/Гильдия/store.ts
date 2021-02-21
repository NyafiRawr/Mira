import { Message } from 'discord.js';
import * as economy from '../../../modules/economy';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { separateThousandth } from '../../../utils';
import config from '../../../config';

export const store = async (message: Message, args: string[]) => {
    const relation = await gildrelations.getOne(
        message.guild!.id,
        message.author.id
    );
    if (relation == null) {
        throw new Error('у тебя нет гильдии, чтобы жертвовать ей печенье.');
    }

    const arg = args.shift();
    if (arg == undefined) {
        throw new Error('не указано количество жертвуемого печенья.');
    }

    const amount = parseInt(arg, 10);
    if (Number.isInteger(amount) == false || amount < 1) {
        throw new Error(
            'ты неправильно указал количество, оно должно быть целочисленным и положительным.'
        );
    }

    await economy.setBalance(message.guild!.id, message.author.id, -amount);

    let gild = await gilds.getOne(relation.gildId);
    if (gild == null) {
        throw new Error(
            `не удалось получить информацию о твоей гильдии, сообщи об этом разработчику.`
        );
    }
    gild = await gild.update({ balance: gild.balance + amount });

    message.reply(
        `ты пожертвовал своей гильдии **${separateThousandth(
            amount.toString()
        )}**:cookie:`,
        {
            embed: {
                color: config.colors.message,
                description: `Теперь у неё ${separateThousandth(
                    gild.balance.toString()
                )}:cookie:`,
            },
        }
    );
};
