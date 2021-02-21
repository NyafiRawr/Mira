import { Message } from 'discord.js';
import config from '../../../config';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { checkUrl, separateThousandth } from '../../../utils';
import { info } from './info';

export const edit = async (message: Message, args: string[]) => {
    const relation = await gildrelations.getOne(
        message.guild!.id,
        message.author.id
    );
    if (relation == null) {
        throw new Error(
            'у тебя нет гильдии, чтобы редактировать информацию гильдии.'
        );
    }

    const gild = await gilds.getOne(relation.gildId);
    if (gild?.ownerId != message.author.id) {
        throw new Error(
            'редактировать информацию о гильдии может только гильдмастер!'
        );
    }

    switch (args.shift()) {
        case 'desc': {
            const description = args.join(' ');
            if (description.length > config.gilds.maxSizeDescription) {
                throw new Error(
                    `превышена максимальная длина описания гильдии: ${description.length}/${config.gilds.maxSizeDescription} символов.`
                );
            }
            if (description.length == 0) {
                await gild.update({ description: null });
            } else {
                const price = await gilds.priceEditDesc(message.guild!.id);
                if (gild.balance < price) {
                    throw new Error(
                        `не хватает: ${separateThousandth(
                            (price - gild.balance).toString()
                        )}/${separateThousandth(price.toString())}:cookie:`
                    );
                }

                await gild.update({
                    description,
                    balance: gild.balance - price,
                });
            }
            break;
        }
        case 'img': {
            const imageURL = args.join(' ');
            if (imageURL.length == 0) {
                await gild.update({ imageURL: null });
            } else {
                if ((await checkUrl(imageURL, 'image')) === false) {
                    throw new Error(
                        'такой ссылки не существует или это не изображение!'
                    );
                }

                const price = await gilds.priceEditImg(message.guild!.id);
                if (gild.balance < price) {
                    throw new Error(
                        `не хватает: ${separateThousandth(
                            (price - gild.balance).toString()
                        )}/${separateThousandth(price.toString())}:cookie:`
                    );
                }

                await gild.update({ imageURL, balance: gild.balance - price });
            }
            break;
        }
        default: {
            throw new Error(
                'ты не указал или указал не верно, то, что хочешь изменить.'
            );
        }
    }

    await info(message, [gild.id.toString()]);
};
