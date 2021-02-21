import { Collection } from 'discord.js';

const gifs = new Collection<
    string,
    {
        description: string;
        messages: string[];
        urls: string[];
    }
>();

gifs.set('baka', {
    description: 'Д-дурак!',
    messages: ['$1 *называет бакой* $2'],
    urls: ['https://nekos.life/api/v2/img/baka'],
});
gifs.set('hug', {
    description: 'Обнять',
    messages: ['$1 *обнимает* $2'],
    urls: ['https://nekos.life/api/v2/img/hug'],
});
gifs.set('kiss', {
    description: 'Поцеловать',
    messages: ['$1 *целует* $2'],
    urls: ['https://nekos.life/api/v2/img/kiss'],
});
gifs.set('slap', {
    description: 'Дать пощёчину',
    messages: ['$1 *бьёт* $2'],
    urls: ['https://nekos.life/api/v2/img/slap'],
});
gifs.set('pat', {
    description: 'Погладить',
    messages: ['$1 *гладит* $2'],
    urls: ['https://nekos.life/api/v2/img/pat'],
});
gifs.set('tickle', {
    description: 'Щекотать',
    messages: ['$1 *щекочет* $2'],
    urls: ['https://nekos.life/api/v2/img/tickle'],
});
gifs.set('poke', {
    description: 'Тыкать',
    messages: ['$1 *тыкает в* $2'],
    urls: ['https://nekos.life/api/v2/img/poke'],
});
gifs.set('meow', {
    description: 'Мяу',
    messages: ['$2 *мяу?* - говорит $1'],
    urls: ['https://nekos.life/api/v2/img/meow'],
});
gifs.set('feed', {
    description: 'Покормить',
    messages: ['$1 *кормит* $2'],
    urls: ['https://nekos.life/api/v2/img/feed'],
});
gifs.set('cuddle', {
    description: 'Прижаться',
    messages: ['$1 *тянется к* $2'],
    urls: ['https://nekos.life/api/v2/img/cuddle'],
});
gifs.set('waifu', {
    description: 'Случайное изображение вайфу',
    messages: ['$1 *хочет увидеть вайфу* $2'],
    urls: ['https://nekos.life/api/v2/img/waifu'],
});

export default gifs;
