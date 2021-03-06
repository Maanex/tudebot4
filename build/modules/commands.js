"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const index_1 = require("../index");
const dbstats_1 = require("../database/dbstats");
const database_1 = require("../database/database");
const wcp_1 = require("../thirdparty/wcp/wcp");
const types_1 = require("../types/types");
const _unavailable_1 = require("../commands/_unavailable");
class CommandsModule extends types_1.Module {
    //
    constructor(conf, data, guilds, lang) {
        super('Commands', 'public', conf, data, guilds, lang);
        this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60000;
        this.activeInCommandsChannel = [];
        this.activeInCommandsChannelRemoveTimer = {};
        this.commands = [];
        this.identifierMap = new Map();
        this.cooldown = new Map();
        this.awaitingResponse = new Map();
    }
    //
    onEnable() {
        this.loadCommands();
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (mes.guild.id === '432899162150010901')
                dbstats_1.DbStats.getUser(mes.author).then(u => u.messagesSent++); // TODO MAKE BETTER
            if (this.awaitingResponse.has(mes.author.id)) {
                const object = this.awaitingResponse.get(mes.author.id);
                if (object.channel.id === mes.channel.id) {
                    clearTimeout(object.timeout);
                    this.awaitingResponse.delete(mes.author.id);
                    object.callback(mes);
                    return;
                }
            }
            const guildInfo = index_1.TudeBot.guildSettings.get(mes.guild.id);
            const channelConfig = this.getCommandChannelConfig(mes.channel);
            if (guildInfo.club)
                this.updateActiveInCommandsChannel(mes.author.id);
            let txt = mes.content;
            if (channelConfig.prefix) {
                if (!txt.startsWith(channelConfig.prefix))
                    return;
                txt = txt.substr(channelConfig.prefix.length);
            }
            const args = txt.split(' ');
            let cmd = args.splice(0, 1)[0].toLowerCase();
            let sudo = false;
            if (cmd === 'sudo' || cmd.charAt(0) === '$') {
                sudo = true;
                if (cmd.charAt(0) === '$') {
                    cmd = cmd.substring(1);
                    if (!cmd)
                        return;
                }
                else {
                    cmd = args.splice(0, 1)[0].toLowerCase();
                    if (!cmd) {
                        this.cmes(mes.channel, mes.author, '`sudo <command> [args..]`');
                        return;
                    }
                }
            }
            if (!sudo && !channelConfig.execute)
                return;
            const command = this.identifierMap.get(cmd);
            if (!command) {
                if (sudo)
                    this.cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
                return;
            }
            this.doExecuteCommand(channelConfig, command);
            if (!channelConfig.execute && !sudo)
                return;
            if (command.sudoOnly && !sudo) {
                this.cmes(mes.channel, mes.author, ':x: Not allowed!', 'bad');
                return;
            }
            if (sudo && !index_1.config.admins.includes(mes.author.id)) {
                this.cmes(mes.channel, mes.author, ':x: Not allowed!', 'bad');
                return;
            }
            if (this.cooldown.get(command.name).includes(mes.author.id)) {
                this.cmes(mes.channel, mes.author, 'Please wait a bit!', 'bad', `This command has a ${command.cooldown}s cooldown!`);
                return;
            }
            function update(success) {
                dbstats_1.DbStats.getCommand(command.name).then((c) => {
                    c.calls.updateToday(1);
                    if (success)
                        c.executions.updateToday(1);
                });
            }
            const cmes = (text, type, desc, settings) => this.cmes(mes.channel, mes.author, text, type, desc, settings);
            const userRes = (user, channel, timeout, callback) => this.awaitUserResponse(user, channel, timeout, callback);
            const event = { message: mes, sudo, label: cmd, awaitUserResponse: userRes };
            const res = command.execute(mes.channel, mes.author, args, event, cmes);
            if (channelConfig.deletemes)
                mes.delete();
            if (res === undefined || res === null)
                update(false);
            else if (typeof res === 'boolean')
                update(res);
            else
                res.then(update).catch(() => { });
            if (!mes.member.hasPermission('MANAGE_MESSAGES')) {
                this.cooldown.get(command.name).push(mes.author.id);
                setTimeout(id => this.cooldown.get(command.name).splice(this.cooldown.get(command.name).indexOf(id), 1), command.cooldown * 1000, mes.author.id);
            }
        });
    }
    getCommandChannelConfig(channel) {
        const guildSettings = this.guilds.get(channel.guild.id);
        let execute = false;
        let prefix = '';
        let whitelist, blacklist;
        let deletemes = false;
        if (guildSettings.global) {
            if (guildSettings.global.enabled)
                execute = true;
            if (guildSettings.global.prefix)
                prefix = guildSettings.global.prefix;
            if (guildSettings.global.whitelist)
                whitelist = guildSettings.global.whitelist;
            if (guildSettings.global.blacklist)
                blacklist = guildSettings.global.blacklist;
            if (guildSettings.global.delete)
                deletemes = true;
        }
        if (guildSettings.channels && guildSettings.channels[channel.id]) {
            const conf = guildSettings.channels[channel.id];
            execute = conf.enabled;
            if (conf.prefix !== undefined)
                prefix = conf.prefix;
            if (conf.whitelist !== undefined)
                whitelist = conf.whitelist || [];
            if (conf.blacklist !== undefined)
                blacklist = conf.blacklist || [];
            if (guildSettings.delete !== undefined)
                deletemes = guildSettings.delete;
        }
        return { execute, prefix, whitelist, blacklist, deletemes };
    }
    doExecuteCommand(channelConfig, command) {
        if (channelConfig.whitelist) {
            channelConfig.execute = false;
            for (const check of channelConfig.whitelist) {
                if (check.startsWith('#')) {
                    if (check === '#all')
                        channelConfig.execute = true;
                    else if (command.groups.includes(check.substr(1)))
                        channelConfig.execute = true;
                }
                else if (command.name === check) {
                    channelConfig.execute = true;
                }
            }
        }
        if (channelConfig.blacklist && channelConfig.execute) {
            for (const check of channelConfig.blacklist) {
                if (check.startsWith('#')) {
                    if (check === '#all')
                        channelConfig.execute = false;
                    else if (command.groups.includes(check.substr(1)))
                        channelConfig.execute = false;
                }
                else if (command.name === check) {
                    channelConfig.execute = false;
                }
            }
        }
        return channelConfig.execute;
    }
    onBotReady() {
    }
    onDisable() {
    }
    loadCommands() {
        this.commands = [];
        this.identifierMap = new Map();
        const unavailableCommand = new _unavailable_1.default();
        this.commands.push(unavailableCommand);
        this.cooldown.set(unavailableCommand.name, []);
        database_1.default
            .collection('settings')
            .findOne({ _id: 'commands' })
            .then((obj) => {
            wcp_1.default.send({ config_commands: JSON.stringify(obj.data) });
            for (const commandName in obj.data) {
                try {
                    const CmdClass = require(`../commands/${commandName}`).default;
                    const cmd = new CmdClass();
                    cmd.lang = this.lang;
                    cmd.resetCooldown = (user) => this.cooldown.get(cmd.name).splice(this.cooldown.get(cmd.name).indexOf(user.id), 1);
                    if (obj.data[commandName]) {
                        cmd.init();
                        this.commands.push(cmd);
                        this.cooldown.set(cmd.name, []);
                    }
                    for (const identifier of [cmd.name, ...cmd.aliases]) {
                        if (this.identifierMap.has(identifier))
                            console.log(chalk.red(`Command "${identifier}" is declared multiple times!`));
                        else
                            this.identifierMap.set(identifier, obj.data[commandName] ? cmd : unavailableCommand);
                    }
                }
                catch (err) {
                    console.error(chalk.bold.red(`Class for command "${commandName}" not found!`));
                    if (process.env.NODE_ENV !== 'production')
                        console.error(err);
                }
            }
        })
            .catch(console.error);
    }
    getCommands() {
        return this.commands;
    }
    getActiveInCommandsChannel() {
        return this.activeInCommandsChannel;
    }
    cmes(channel, author, text, type, description, settings) {
        if (type === 'error')
            text = ':x: ' + text;
        if (type === 'success')
            text = ':white_check_mark: ' + text;
        channel.send({
            embed: {
                color: 0x2F3136,
                title: description ? `${text}` : '',
                description: description ? `${description || ''}` : `${text}`,
                footer: {
                    text: '@' + author.username + (type === 'bad' ? ' • not successful' : '') + (settings && settings.footer ? ` • ${settings.footer}` : '')
                },
                thumbnail: { url: settings && settings.image },
                image: { url: settings && settings.banner }
            }
        });
    }
    updateActiveInCommandsChannel(id) {
        if (!this.activeInCommandsChannel.includes(id)) {
            this.activeInCommandsChannel.push(id);
            this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
                this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
                delete this.activeInCommandsChannelRemoveTimer[id];
            }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
        }
        else {
            clearTimeout(this.activeInCommandsChannelRemoveTimer[id]);
            this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
                this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
                delete this.activeInCommandsChannelRemoveTimer[id];
            }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
        }
    }
    awaitUserResponse(user, channel, timeout, callback) {
        if (this.awaitingResponse.has(user.id))
            return;
        const object = {
            user,
            channel,
            callback,
            timeout: undefined
        };
        this.awaitingResponse.set(user.id, object);
        const nodeTimeout = setTimeout(() => {
            this.awaitingResponse.delete(user.id);
            callback(null);
        }, timeout);
        object.timeout = nodeTimeout;
    }
}
exports.default = CommandsModule;
//# sourceMappingURL=commands.js.map