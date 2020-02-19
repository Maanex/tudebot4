"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
class QuotesModule extends types_1.Module {
    constructor(bot, conf, data, lang) {
        super('Module Name', 'private', bot, conf, data, lang);
        this.UPDATE_COOLDOWN = 2 * 60000;
        this.UPDATE_EMOJI = '🔄';
        this.channels = [];
    }
    onEnable() {
        this.bot.on('messageReactionAdd', (reaction, user) => {
            let mes = reaction.message;
            if (user.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
                return;
            if (reaction.emoji.name == this.UPDATE_EMOJI)
                this.update(mes.channel);
        });
    }
    onBotReady() {
        for (let path of this.conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid)
                return;
            let guild = this.bot.guilds.get(guildid);
            if (!guild)
                return;
            let channel = guild.channels.get(channelid);
            if (!channel)
                return;
            this.channels.push(channel);
        }
        let lastmin = 0;
        this.interval = setInterval(() => {
            let currmin = new Date().getMinutes();
            if (currmin == lastmin)
                return;
            lastmin = currmin;
            if (currmin != 0)
                return;
            this.channels.forEach(this.update);
        }, 30000);
        this.channels.forEach(this.update);
    }
    onDisable() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    update(channel) {
        this.generateLeaderboard(channel.guild).then(content => {
            channel.fetchMessages().then(m => {
                if (m.size) {
                    let mes = m.first();
                    mes.edit(content);
                    mes.clearReactions();
                    setTimeout(() => {
                        mes.react(this.UPDATE_EMOJI);
                    }, this.UPDATE_COOLDOWN);
                }
                else {
                    channel.send(content).then(mes => {
                        mes.react(this.UPDATE_EMOJI);
                    }).catch(err => {
                        this.bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
                    });
                }
            }).catch(err => {
                this.bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
            });
        }).catch(err => {
            this.bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
        });
    }
    generateLeaderboard(guild) {
        return new Promise((resolve, reject) => {
            tudeapi_1.default.clubLeaderboard().then(leaderboard => {
                let out = `   | All Time           | This Month\n---+--------------------+-------------------`;
                let at, tm, ats, tms, u, pm;
                for (let i = 0; i < 10; i++) {
                    at = leaderboard.alltime[i];
                    u = at ? guild.members.get(at.user['accounts'].discord) : null;
                    if (at)
                        ats = `${u ? u.user.username : at.user.name}..............`.slice(0, 13) + `..lv${at.level}`.slice(-5);
                    else
                        ats = '                  ';
                    tm = leaderboard.month[i];
                    u = tm ? guild.members.get(tm.user['accounts'].discord) : null;
                    if (tm) {
                        if (tm.points_month > 1000) {
                            let smol = Math.floor(tm.points_month / 100);
                            if (smol > 99) {
                                smol = Math.floor(tm.points_month / 10);
                                pm = smol + 'k';
                            }
                            else {
                                pm = `${smol}`.charAt(0) + '.' + `${smol}`.charAt(1) + 'k';
                            }
                        }
                        else
                            pm = tm.points_month + '';
                        tms = `${u ? u.user.username : tm.user.name}..............`.slice(0, 13) + `......${pm}`.slice(-5);
                    }
                    else
                        tms = '                  ';
                    out += `\n${((i + 1) + '. ').slice(0, 3)}| ${ats} | ${tms}`;
                }
                out += `\nLast Update: ${new Date(leaderboard.updated)}`;
                if (new Date().getHours() == 0) { // Whale fact time
                    out += '``` ```fix\nWhale fact of the day: ';
                    let facts = this.data.whalefacts;
                    out += facts[new Date().getDate() % facts.length];
                }
                resolve('```cs\n' + out + '```');
            }).catch(reject);
        });
    }
}
exports.default = QuotesModule;
//# sourceMappingURL=autoleaderboard.js.map