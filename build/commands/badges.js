"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
const emojis_1 = require("../int/emojis");
class BadgesCommand extends types_1.Command {
    constructor() {
        super({
            name: 'badges',
            aliases: ['badge', 'b'],
            description: 'See your badges (or someone elses)\nuse `badge display <name>` to display a badge on your profile',
            groups: ['club'],
        });
    }
    execute(channel, orgUser, args, event, repl) {
        return new Promise((resolve, reject) => {
            let user = orgUser;
            if (event.message.mentions.users.size) {
                user = event.message.mentions.users.first();
            }
            else if (args.length) {
                switch (args[0].toLowerCase()) {
                    case 'show':
                    case 'setdisplay':
                    case 'display':
                    case 'displ':
                    case 'disp':
                    case 'd':
                        if (args.length < 2) {
                            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                                .then(u => {
                                if (!u.profile.disp_badge) {
                                    if (u.profile.disp_badge == 0)
                                        repl('You don\'t show any badge on your profile!', 'bad', 'to change that use `badge display <badge>`');
                                    else
                                        repl('`badge display <badge>`', 'bad');
                                    return;
                                }
                                u.profile.disp_badge = 0;
                                tudeapi_1.default.updateClubUser(u);
                                repl('Displayed badge clear!', 'success', 'Your profile looks cleaner now.');
                            })
                                .catch(err => repl('An error occured!', 'error'));
                            return;
                        }
                        let badge = tudeapi_1.default.badgeByKeyword(args[1]);
                        if (!badge) {
                            if (args[1].startsWith('<'))
                                repl(`Badge ${args[1]} not found!`, 'bad', 'Don\'t use those `<` and `>` you got there! Leave them out!');
                            else
                                repl(`Badge ${args[1]} not found!`, 'bad');
                            return;
                        }
                        tudeapi_1.default.clubUserByDiscordId(user.id, user)
                            .then(u => {
                            if (u.badges[badge.id] <= 0) {
                                repl('You do not own this badge!', 'bad');
                                return;
                            }
                            u.profile.disp_badge = badge.id;
                            tudeapi_1.default.updateClubUser(u);
                            repl('Displayed badge updated!', 'success', 'Go have a look at your profile with `profile`');
                        })
                            .catch(err => repl('An error occured!', 'error'));
                    default:
                        const lookup = tudeapi_1.default.badgeByKeyword(args[0])
                            || tudeapi_1.default.badgeBySearchQuery(args.join(' '));
                        if (!lookup) {
                            repl(':grey_question:', 'bad', `No badge by the name \`${args.join(' ')}\` found!`);
                            return;
                        }
                        channel.send(this.createBadgeInfoEmbed(lookup));
                }
                return;
            }
            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                .then(u => {
                if (!u || u.error) {
                    repl('User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }
                let badges = [];
                let badgeZeroId = '';
                if (u.badges) {
                    for (let b in u.badges) {
                        let badge = tudeapi_1.default.badgeById(parseInt(b));
                        if (!badge)
                            continue;
                        if (!badgeZeroId)
                            badgeZeroId = badge.keyword;
                        let appearance = badge.getAppearance(u.badges[b]);
                        badges.push({
                            name: appearance.emoji + ' `' + appearance.name + '` (' + badge.keyword + ')',
                            value: badge.description.replace('%s', u.badges[b])
                        });
                    }
                }
                if (!event.message.mentions.users.size && badges.length && u.profile.disp_badge == undefined)
                    badges.push({
                        name: 'Pro-tip: 👇',
                        value: `Use the command \`badge display ${badgeZeroId}\`\nto show that badge on your profile!`
                    });
                let banana = Math.random() < .1;
                channel.send({
                    embed: {
                        author: {
                            name: `${user.username}'s badges:`,
                            icon_url: user.avatarURL
                        },
                        color: 0x2f3136,
                        fields: badges,
                        image: { url: (badges.length || !banana) ? '' : 'https://cdn.discordapp.com/attachments/655354019631333397/656567439391326228/banana.png' },
                        description: badges.length ? '' : (banana ? 'Empathy banana is here for you.' : '... *none*'),
                    }
                });
                resolve(true);
            })
                .catch(err => {
                repl('An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
    createBadgeInfoEmbed(badge) {
        return new discord_js_1.RichEmbed({
            title: `${badge.getAppearance(0).name} ${emojis_1.default.BIG_SPACE} \`${badge.keyword}\``,
            description: badge.info,
            fields: badge.appearance.length == 1 ? undefined : [
                {
                    name: 'Stages',
                    value: badge.appearance.map(a => (a.from == 0) ? '' : `${badge.getAppearance(a.from).emoji} **${a.name}** (${a.from}x)`).join('\n')
                }
            ],
            thumbnail: { url: badge.getAppearance(0).icon },
            color: 0x2f3136
        });
    }
}
exports.default = BadgesCommand;
//# sourceMappingURL=badges.js.map