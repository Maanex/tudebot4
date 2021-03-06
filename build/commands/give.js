"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
const itemlist_1 = require("../content/itemlist");
class GiveCommand extends types_1.Command {
    constructor() {
        super({
            name: 'give',
            aliases: ['g', 'send', 'trade', 'transaction', 'transcribe', 'transfer', 'yowtfjustgivethisdudewhatheneedsboi', 'wtfevenisthisbullshietherelikeforfookssakewhyaretheresoweirdcommandaliaseslikethisonewhyyyyy'],
            description: 'Transfer items or cookies to other players',
            cooldown: 5,
            groups: ['club']
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve) => {
            // const cmdl = ParseArgs.parse(args)
            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                .then((u) => {
                if (!u || u.error) {
                    repl('Couldn\'t fetch your userdata!', 'message', 'That\'s not cool.');
                    resolve(false);
                    return;
                }
                if (u.level < 3) {
                    repl('I\'m sorry, but you\'re not allowed to do that!', 'bad', 'You need to be at least level 3 to trade with other players!');
                    resolve(false);
                    return;
                }
                if (args.length < 2) {
                    repl('give <@someone> <amount> [itemname]', 'bad', 'Don\'t provide an item name in order to send them your cookies');
                    resolve(false);
                    return;
                }
                const otherPerson = event.message.mentions.users.first();
                if (!otherPerson) {
                    repl(`Who tf is ${args[0]}?`, 'bad');
                    resolve(false);
                    return;
                }
                if (otherPerson.bot) {
                    repl(`${otherPerson.username} doesn't want your stuff!`, 'bad', 'In other words: they\'re a bot and cannot recieve items.');
                    resolve(false);
                    return;
                }
                if (otherPerson.id === user.id) {
                    channel.send({
                        embed: {
                            color: 0x2F3136,
                            image: { url: 'https://cdn.discordapp.com/attachments/655354019631333397/669183258679967744/34yx3j.png' },
                            footer: { text: `@${user.username}` }
                        }
                    });
                    resolve(false);
                    return;
                }
                tudeapi_1.default.clubUserByDiscordId(otherPerson.id, otherPerson).then((rec) => {
                    if (rec.level < 3) {
                        repl(`Oh no, you cannot trade with ${otherPerson.username}!`, 'bad', 'They need to be at least level 3 in order to recieve items!');
                        resolve(false);
                        return;
                    }
                    args.splice(0, 1);
                    // const force = cmdl.f || cmdl.force
                    let amountSet = false;
                    let typeSet = false;
                    let amount = 1;
                    let type = 'cookie';
                    let dispName = 'cookie';
                    let dispNamePl = 'cookies';
                    let item = null;
                    for (const arg of args) {
                        if (arg.toLowerCase() === 'a' || arg.toLowerCase() === 'all') {
                            amount = -42;
                            amountSet = true;
                        }
                        else if (!isNaN(parseInt(arg))) {
                            amount = parseInt(arg);
                            amountSet = true;
                        }
                        else {
                            item = u.inventory.get(arg.toLowerCase());
                            if (!item) {
                                const listItem = itemlist_1.ItemList.find(i => i.id === arg.toLowerCase());
                                if (!listItem) {
                                    repl(`Item ${arg} not found!`, 'bad');
                                    resolve(false);
                                    return;
                                }
                                else {
                                    repl(`You don't have any ${tudeapi_1.default.clubLang['itempl_' + listItem.id]}!`, 'bad');
                                    resolve(false);
                                    return;
                                }
                            }
                            const itemPrefab = itemlist_1.ItemList.find(i => i.id === item.prefab.id);
                            dispName = tudeapi_1.default.clubLang['item_' + itemPrefab.id];
                            dispNamePl = tudeapi_1.default.clubLang['itempl_' + itemPrefab.id];
                            type = arg.toLowerCase();
                            typeSet = true;
                        }
                    }
                    if (args.length > 1) {
                        if (!amountSet) {
                            repl(`${args[1]} is not a valid amount!`, 'bad');
                            resolve(false);
                            return;
                        }
                        if (!typeSet) {
                            repl(`Item ${args[1]} not found!`, 'bad');
                            resolve(false);
                            return;
                        }
                    }
                    if (item) {
                        if (!item.prefab.tradeable) {
                            repl(`${dispNamePl} are unfortunately not tradeable!`, 'bad');
                            resolve(false);
                            return;
                        }
                    }
                    if (amount === -42) {
                        if (item)
                            amount = item.amount;
                        else
                            amount = u.cookies;
                        if (amount <= 0) {
                            repl(`You don't have any ${dispNamePl}!`, 'bad');
                            resolve(false);
                            return;
                        }
                    }
                    if (amount <= 0) {
                        repl(`You cannot send 0 or less ${dispNamePl}!`, 'bad');
                        resolve(false);
                        return;
                    }
                    const haveAmount = (item ? item.amount : u.cookies);
                    if (amount > haveAmount) {
                        repl(`You cannot give away ${amount} ${dispNamePl}! You only have ${haveAmount}!`, 'bad');
                        resolve(false);
                        return;
                    }
                    tudeapi_1.default.performClubUserAction(u, { id: 'transaction', amount, type, reciever: rec.id }).then(() => {
                        channel.send({
                            embed: {
                                color: 0x4DC88A,
                                title: 'Transaction completed.',
                                description: `${otherPerson.username} recieved **${amount} ${amount === 1 ? dispName : dispNamePl}** from ${user.username}.`,
                                footer: { text: `@${user.username}` }
                            }
                        });
                        if (!index_1.TudeBot.getModule('commands').getActiveInCommandsChannel().includes(otherPerson.id)) {
                            otherPerson.send({
                                embed: {
                                    color: 0x4DC88A,
                                    title: this.lang('give_dm_title'),
                                    description: `${user.username} sent you **${amount} ${amount === 1 ? dispName : dispNamePl}**. ${this.lang('give_dm_catchline')}`,
                                    footer: { text: 'I sent you this via DM because I thought you might not see it otherwise' }
                                }
                            });
                        }
                        resolve(true);
                    }).catch((o) => {
                        if (o && o.message)
                            repl(o.message, 'bad');
                        else
                            repl('An error occured!', 'bad');
                        console.error(o);
                        resolve(false);
                    });
                }).catch((err) => {
                    repl('An error occured!', 'bad');
                    console.error(err);
                    resolve(false);
                });
            })
                .catch((err) => {
                repl('An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
}
exports.default = GiveCommand;
//# sourceMappingURL=give.js.map