# Mira | Discord бот

<p>
<img src="https://github.com/NyafiRawr/Mira/workflows/Default%20workflow/badge.svg" alt="GitHub workflows" />
<img src="https://img.shields.io/github/package-json/v/NyafiRawr/Mira" alt="GitHub package.json version" />
<a href="https://github.com/NyafiRawr/Mira/pulls"><img src="https://img.shields.io/github/issues-pr/NyafiRawr/Mira" alt="GitHub pull requests" /></a>
<p/><p>
<a href="https://discord.gg/dYmrSZa"><img src="https://img.shields.io/discord/736861365850865784"alt="Discord Server" /></a>
<p/>

## Как самостоятельно запустить бота?

1. Скачиваем репозиторий
2. Настраиваем `.env.example` ([Discord Token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)), а затем сохраняем как `.env`. Все важные надстройки размещены в файле `./src/config.ts`, который так же можно отредактировать по своему желанию
3. Устанавливаем окружение [Node JS](https://nodejs.org/ru/download/)
4. Открываем консоль в папке бота и устанавливаем зависимости: `npm i`
5. Компилируем `npm run build`
6. Запускаем `npm run start`

Важно! Не забудьте создать базу данных с именем, которое указали в настройках .env