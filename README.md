# Mira | Discord бот

<p>
<img src="https://github.com/NyafiRawr/Mira/workflows/Default%20workflow/badge.svg" alt="GitHub workflows" />
<img src="https://img.shields.io/github/package-json/v/NyafiRawr/Mira" alt="GitHub package.json version" />
<a href="https://github.com/NyafiRawr/Mira/pulls"><img src="https://img.shields.io/github/issues-pr/NyafiRawr/Mira" alt="GitHub pull requests" /></a>
<p/><p>
<a href="https://discord.gg/dYmrSZa"><img src="https://img.shields.io/discord/736861365850865784"alt="Discord Server" /></a>
<p/>

## Как самостоятельно запустить бота?

0. Скачиваем репозиторий
1. Настраиваем `.env.example` ([Discord Token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)), а затем сохраняем как `.env`. Все важные надстройки размещены в файле `./src/config.ts`, который так же можно отредактировать по своему желанию
2. Устанавливаем окружение [Node JS](https://nodejs.org/ru/download/)
3. Открываем консоль в папке бота и устанавливаем зависимости: `npm i`
4. Компилируем код `npm run build`
5. Запускаем бота `npm run start`

Важно! Если используете mysql, то не забудьте создать базу данных с именем, которое указали в настройках .env