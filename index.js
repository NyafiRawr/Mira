// todo: вынести в другое место
// загружаем переменные окружения из .env файла
require('dotenv').config({ debug: process.env.DEBUG });

// подключаем babel.js для работы с последними фитчами из ecmascript
require('@babel/register');

// запускаем бота
require('./src/bot');
