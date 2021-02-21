import { Message } from 'discord.js';

import { info } from './Доступ/info';
import { allow } from './Доступ/allow';
import { deny } from './Доступ/deny';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Контроль доступа',
    aliases: ['a'],
    permissions: ['ADMINISTRATOR'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        switch (args.shift()) {
            case 'deny': {
                if (!message.member?.hasPermission(this.permissions[0])) {
                    throw new Error(
                        `необходима глобальная привилегия ${this.permissions[0]}.`
                    );
                }
                return deny(message, args);
            }
            case 'allow': {
                if (!message.member?.hasPermission(this.permissions[0])) {
                    throw new Error(
                        `необходима глобальная привилегия ${this.permissions[0]}.`
                    );
                }
                return allow(message, args);
            }
            default: {
                return info(message);
            }
        }
    },
};
