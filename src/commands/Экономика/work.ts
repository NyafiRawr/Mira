import { Message } from 'discord.js';
import * as users from '../../modules/users';
import config from '../../config';
import { randomInteger, separateThousandth } from '../../utils';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Поработай и получи печенье! (карма = больше печенья)',
    aliases: ['timely', 'цщкл'],
    cooldown: {
        seconds: 75600,
        messages: [
            'ты сегодня уже получал печенье! Неужели все съел?! (timeLeft)',
            'а тебя толстая девочка в садике не кусала? (timeLeft)',
            'ничто так не нарушает красоту души и очарование внутреннего мира, как толстая попа! (timeLeft)',
            'скрыть возраст легко, вес – гораздо сложнее! (timeLeft)',
            'переедание гасит блеск в наших глазах! (timeLeft)',
            'вновь хочешь печенья? Ну уж нет, нельзя так торопить приход диабета! (timeLeft)',
            'дети до семи лет должны есть больше сладостей, чтобы у них молочные зубы выпадали и вырастали новые и красивые, но тебе вот совсем не семь лет! (timeLeft)',
            'если счастье не в печенье, то в чем? Но не будем забывать, что все должно быть в меру! (timeLeft)',
            'конфеты придуманы для счастливых людей, чтобы сделать их жизнь ещё слаще, но когда конфеты начинают есть несчастные люди – это приводит их к ожирению! (timeLeft)',
            'детям мучное вредно. Отдай печеньку! (timeLeft)',
            'пеку-пеку! (timeLeft)',
            'хмм, ещё печенек, а, собственно, за что? (timeLeft)',
            'если хочешь больше печенья, то приготовь его сам! (timeLeft)',
            'лезешь вне очереди? (timeLeft)',
            'работа угнетает сознание, а ты на сегодня уже угнетен! (timeLeft)',
            'у меня нет лишнего печенья для тебя! (timeLeft)',
            'я бы тоже хотела получать печенье по команде! (timeLeft)',
            'вообще-то, я работаю на кухне, а не на печеньковом станке! (timeLeft)',
            'не сейчас (timeLeft)',
        ],
    },
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message) {
        let user = await users.get(message.guild!.id, message.author.id);
        const earned = randomInteger(50, 100 + user.reputation);
        user = await user.update({ balance: user.balance + earned });

        message.reply(`+**${separateThousandth(earned.toString())}**:cookie:`, {
            embed: {
                color: config.colors.message,
                description: `Теперь у тебя ${separateThousandth(
                    user!.balance.toString()
                )}:cookie:`,
            },
        });
    },
};
