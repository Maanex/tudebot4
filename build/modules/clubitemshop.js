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
const index_1 = require("../index");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const database_1 = require("../database/database");
const types_1 = require("../types/types");
const emojis_1 = require("../int/emojis");
const itemlist_1 = require("../content/itemlist");
class ClubItemShopModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Tude Club Item Shop', 'private', conf, data, guilds, lang);
        this.channels = [];
    }
    onEnable() {
    }
    onBotReady() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const guildid of this.guilds.keys()) {
                const guild = yield index_1.TudeBot.guilds.fetch(guildid);
                if (!guild)
                    return;
                for (const channelid of this.guilds.get(guildid).channels) {
                    const channel = guild.channels.resolve(channelid);
                    if (!channel)
                        return;
                    this.channels.push(channel);
                }
            }
            this.getShopdata().then((d) => {
                this.channels.forEach(c => this.update(c, d));
            }).catch(console.error);
            index_1.TudeBot.on('message', (mes) => {
                if (!this.isMessageEventValid(mes))
                    return;
                if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                    return;
                const args = mes.content.toLowerCase().split(' ');
                function repl(message, desc) {
                    mes.channel.send({
                        embed: {
                            title: desc ? message : '',
                            description: desc || message,
                            color: 0x2F3136,
                            footer: { text: `@${mes.author.tag}` }
                        }
                    }).then((mes) => {
                        mes.delete({ timeout: 7000 });
                    });
                }
                mes.delete({ timeout: 5000 });
                const item = itemlist_1.findItem(args[0]);
                if (!item) {
                    repl(`Item \`${args[0]}\` not found!`);
                    return;
                }
                let amount = 1;
                if (args.length > 1) {
                    if (item.expanded) {
                        repl('You can only buy one item of this kind at a time!');
                        return;
                    }
                    amount = parseInt(args[1]);
                    if (!amount || isNaN(amount) || amount <= 0) {
                        repl(`\`${args[1]}\` is an invalid amount!`);
                        return;
                    }
                }
                this.getShopdata().then((d) => {
                    for (const shelf of d) {
                        for (const sitem of shelf.items) {
                            if (sitem.item === item.id) {
                                tudeapi_1.default.clubUserByDiscordId(mes.author.id).then((u) => {
                                    if (!u)
                                        return;
                                    const price = (sitem.discount || sitem.price) * amount;
                                    let currencyEmoji = '';
                                    let currencyLeft = 0;
                                    if (sitem.currency === 'cookies') {
                                        if (u.cookies < price) {
                                            repl(`This would cost ${price} ${emojis_1.default.COOKIES}, you only have ${u.cookies}!`);
                                            return;
                                        }
                                        u.cookies -= price;
                                        currencyEmoji = emojis_1.default.COOKIES;
                                        currencyLeft = u.cookies;
                                    }
                                    else if (sitem.currency === 'gems') {
                                        if (u.gems < price) {
                                            repl(`This would cost ${price} ${emojis_1.default.GEMS}, you only have ${u.gems}!`);
                                            return;
                                        }
                                        u.gems -= price;
                                        currencyEmoji = emojis_1.default.GEMS;
                                        currencyLeft = u.gems;
                                    }
                                    else if (sitem.currency === 'event-tokens') {
                                        repl('Huh? Not implemented. Ping @Maanex, thx');
                                        return;
                                    }
                                    const itemi = u.addItem(item);
                                    if (!itemi)
                                        return;
                                    repl(`You purchased ${amount} ${tudeapi_1.default.clubLang[(amount === 1 ? 'item_' : 'itempl_') + itemi.id]} for ${price} ${currencyEmoji}`, `You now have ${itemi.amount} ${itemi.name} and ${currencyLeft} ${currencyEmoji} left!`);
                                    tudeapi_1.default.updateClubUser(u);
                                });
                                return;
                            }
                        }
                    }
                    repl(`We do not have ${tudeapi_1.default.clubLang['itempl_' + item.id]} in sock at the moment, sorry!`);
                });
            });
        });
    }
    onDisable() {
    }
    update(channel, shelfs) {
        channel.messages.fetch().then((mes) => {
            if (mes.size) {
                let c = 0;
                for (const m of mes.array()) {
                    if (m.author.id !== index_1.TudeBot.user.id)
                        continue;
                    if (c === 0) {
                        if (!m.embeds.length) {
                            m.edit('​\n\n\n​' /* contains two zero with dividers at start and end of the string */, {
                                embed: {
                                    title: 'Welcome to the shop!',
                                    color: 0x2F3136,
                                    description: '*Scroll up to browse the shelfs!*\n> To purchase an item, just type it\'s name into this channel.\n> To buy multiple of a kind, let\'s say 5 fishing lure, just add\n> the amount like so: `lure 5`.',
                                    footer: { text: 'Purchasing an item cannot be undone.' }
                                }
                            });
                        }
                    }
                    else if (c < shelfs.length + 1) {
                        const s = shelfs[shelfs.length - c];
                        if (s.changes)
                            m.edit('', { embed: this.shelfToEmbed(s) });
                    }
                    else if (m.embeds.length) {
                        m.edit(emojis_1.default.BIG_SPACE, { embed: null });
                    }
                    c++;
                }
            }
            else {
                index_1.TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`', 'medium');
            }
        }).catch((err) => {
            index_1.TudeBot.modlog(channel.guild, 'warning', 'Itemshop could not get updated! Error: ```' + err + '```', 'medium');
        });
    }
    shelfToEmbed(shelf) {
        return {
            title: shelf.title,
            color: this.getShelfColor(shelf.category),
            description: shelf.items.map((i) => {
                const itemdata = itemlist_1.findItem(i.item);
                if (!itemdata)
                    return 'error, item not found: ' + i.item;
                return `${itemdata.icon} ${tudeapi_1.default.clubLang['item_' + itemdata.id]}\n${emojis_1.default.BIG_SPACE} \`${i.item}\` • ${i.discount ? `~~${i.price}~~ **${i.discount}**` : i.price} ${this.getCurrencyIcon(i.currency)}`;
            }).join('\n\n')
        };
    }
    getShelfColor(category) {
        switch (category) {
            case 'regular': return 0xC88B6D;
            case 'gem': return 0x44B674;
            case 'special': return 0x768DC7;
            case 'event': return 0xFFFFFF; // EVENT-UPDATE
        }
    }
    getCurrencyIcon(currency) {
        switch (currency) {
            case 'cookies': return emojis_1.default.COOKIES;
            case 'gems': return emojis_1.default.GEMS;
            case 'event-tokens': return '[]'; // EVENT-UPDATE
        }
    }
    getShopdata() {
        return __awaiter(this, void 0, void 0, function* () {
            let target = (yield database_1.default.collection('clubitemshop').findOne({ _id: 'target' })).shelfs;
            let current = (yield database_1.default.collection('clubitemshop').findOne({ _id: 'current' })).shelfs;
            target = target.reverse();
            current = current.reverse();
            const out = [];
            for (let i = 0; i < target.length; i++) {
                const s = Object.assign({}, target[i]);
                s.changes = !this.areShelfsEqual(target[i], current[i]);
                out.push(s);
            }
            database_1.default.collection('clubitemshop').updateOne({ _id: 'current' }, { $set: { shelfs: target.reverse() } });
            return out.reverse();
        });
    }
    areShelfsEqual(shelf1, shelf2) {
        if (shelf1 === undefined)
            return shelf2 === undefined;
        if (shelf2 === undefined)
            return false;
        if (shelf1.category !== shelf2.category)
            return false;
        if (shelf1.title !== shelf2.title)
            return false;
        if (shelf1.items.length !== shelf2.items.length)
            return false;
        for (let i = 0; i < shelf1.items.length; i++) {
            if (shelf1.items[i].price !== shelf2.items[i].price)
                return false;
            if (shelf1.items[i].item !== shelf2.items[i].item)
                return false;
            if (shelf1.items[i].discount !== shelf2.items[i].discount)
                return false;
            if (shelf1.items[i].currency !== shelf2.items[i].currency)
                return false;
        }
        return true;
    }
}
exports.default = ClubItemShopModule;
//# sourceMappingURL=clubitemshop.js.map