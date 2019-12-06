"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const chalk = require('chalk');
const settings = require('../config/settings.json');
class TudeBot extends discord_js_1.Client {
    constructor(props) {
        super(props);
        this.m = {};
        this.modules = [
            'modlog',
            'quotes',
            'counting',
            'selfroles',
            'commands',
            'happybirthday',
            'thebrain',
            'memes',
        ];
        fixReactionEvent(this);
        let lang = key => {
            let res = require(`../config/lang.json`)[key];
            if (!res)
                return '';
            if (res.length !== undefined)
                return res[Math.floor(Math.random() * res.length)];
            return res;
        };
        this.modules.forEach(mod => {
            this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], require(`../config/moduledata/${mod}.json`), lang);
        });
        this.on('ready', () => console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag)));
        this.login(settings.bot.token);
    }
}
exports.TudeBot = TudeBot;
const Core = new TudeBot({
    disabledEvents: [
        'TYPING_START',
    ]
});
function fixReactionEvent(bot) {
    const events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    };
    bot.on('raw', (event) => __awaiter(this, void 0, void 0, function* () {
        const ev = event;
        if (!events.hasOwnProperty(ev.t))
            return;
        const data = ev.d;
        const user = bot.users.get(data.user_id);
        const channel = bot.channels.get(data.channel_id) || (yield user.createDM());
        if (channel.messages.has(data.message_id))
            return;
        const message = yield channel.fetchMessage(data.message_id);
        const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        const reaction = message.reactions.get(emojiKey);
        bot.emit(events[ev.t], reaction, user);
    }));
}
//# sourceMappingURL=index.js.map