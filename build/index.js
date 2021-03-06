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
/* eslint-disable import/namespace */
const discord_js_1 = require("discord.js");
const chalk = require("chalk");
const dotenv_1 = require("dotenv");
const moment = require("moment");
const tudeapi_1 = require("./thirdparty/tudeapi/tudeapi");
const wcp_1 = require("./thirdparty/wcp/wcp");
const database_1 = require("./database/database");
const mongo_adapter_1 = require("./database/mongo.adapter");
const util_1 = require("./util/util");
const git_parser_1 = require("./util/git-parser");
const parse_args_1 = require("./util/parse-args");
const obrazium_1 = require("./thirdparty/obrazium/obrazium");
const server_1 = require("./server/server");
const perspective_api_1 = require("./thirdparty/googleapis/perspective-api");
const alexa_api_1 = require("./thirdparty/alexa/alexa-api");
class TudeBotClient extends discord_js_1.Client {
    constructor(props, config) {
        super(props);
        this.config = null;
        this.modules = null;
        this.guildSettings = null;
        this.obrazium = null;
        this.perspectiveApi = null;
        this.alexaAPI = null;
        this.devMode = process.env.NODE_ENV !== 'production';
        this.config = config;
        this.modlog = null;
        this.modules = new Map();
        this.guildSettings = new Map();
        if (this.devMode)
            console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
        git_parser_1.logVersionDetails();
        fixReactionEvent(this);
        util_1.Util.init();
        wcp_1.default.init(false /* this.devMode */);
        moment.locale('en-gb');
        mongo_adapter_1.default.connect(this.config.mongodb.url)
            .catch((err) => {
            console.error(err);
            wcp_1.default.send({ status_mongodb: '-Connection failed' });
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to Mongo');
            wcp_1.default.send({ status_mongodb: '+Connected' });
            yield tudeapi_1.default.init(this.config.lang);
            yield database_1.default.init();
            yield server_1.default.start(this.config.server.port);
            this.obrazium = new obrazium_1.default(this.config.thirdparty.obrazium.token);
            this.perspectiveApi = new perspective_api_1.default(this.config.thirdparty.googleapis.key);
            this.alexaAPI = new alexa_api_1.default(this.config.thirdparty.alexa.key);
            // TODO find an actual fix for this instead of this garbage lol
            const manualConnectTimer = setTimeout(() => {
                // @ts-ignore
                this.ws.connection.triggerReady();
            }, 30000);
            this.on('ready', () => {
                console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
                clearTimeout(manualConnectTimer);
                wcp_1.default.send({ status_discord: '+Connected' });
                for (const mod of this.modules.values())
                    mod.onBotReady();
            });
            yield this.loadGuilds(false);
            yield this.loadModules(false);
            this.login(this.config.bot.token);
        }));
    }
    loadGuilds(_isReload) {
        return new Promise((resolve, reject) => {
            database_1.default
                .collection('settings')
                .find({ guild: true })
                .toArray()
                .then((guilds) => {
                this.guildSettings = new Map();
                for (const guild of guilds) {
                    const setting = {
                        id: guild._id,
                        name: guild.name,
                        club: guild.club,
                        managers: guild.managers,
                        modules: guild.modules
                    };
                    this.guildSettings.set(guild._id, setting);
                }
                resolve();
            })
                .catch((err) => {
                console.error('An error occured while fetching guild configuration data');
                console.error(err);
                reject(err);
            });
        });
    }
    loadModules(isReload) {
        return new Promise((resolve, reject) => {
            database_1.default
                .collection('settings')
                .findOne({ _id: 'modules' })
                .then((data) => {
                data = data.data;
                wcp_1.default.send({ config_modules: JSON.stringify(data) });
                for (const mod of this.modules.values())
                    mod.onDisable();
                this.modules = new Map();
                this.modlog = undefined;
                for (const mod in data) {
                    let modData = {};
                    try {
                        modData = require(`../config/moduledata/${mod}.json`);
                    }
                    catch (ex) { }
                    const guilds = new Map();
                    for (const guild of this.guildSettings.values()) {
                        if (guild.modules[mod])
                            guilds.set(guild.id, guild.modules[mod]);
                    }
                    try {
                        let ModClass;
                        try {
                            ModClass = require(`./modules/${mod}`).default;
                        }
                        catch (ex) {
                            try {
                                ModClass = require(`./modules/${mod}/${mod}`).default;
                            }
                            catch (ex) { }
                        }
                        if (!ModClass) {
                            console.error(`Module ${mod} not found!`);
                            continue;
                        }
                        const module = new ModClass(data[mod], modData, guilds, this.lang);
                        this.modules.set(mod, module);
                        if (isReload)
                            module.onBotReady();
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
                for (const module of this.modules.values())
                    module.onEnable();
                resolve();
            })
                .catch((err) => {
                console.error('An error occured while fetching module configuration data');
                console.error(err);
                reject(err);
            });
        });
    }
    lang(key, params) {
        let res = require('../config/lang.json')[key];
        if (!res)
            return key;
        if (res.push !== undefined)
            res = res[Math.floor(Math.random() * res.length)];
        for (const key in params)
            res = res.split(`{${key}}`).join(params[key]);
        return res;
    }
    optionalLang(key, params) {
        if (key.startsWith('lang:'))
            return this.lang(key.substr(5), params);
        for (const param in params)
            key = key.split(`{${param}}`).join(params[param]);
        return key;
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeAllListeners();
            fixReactionEvent(this);
            yield this.loadGuilds(true);
            yield this.loadModules(true);
            this.emit('ready');
        });
    }
    getModule(name) {
        return this.modules.get(name);
    }
}
exports.TudeBotClient = TudeBotClient;
dotenv_1.config();
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const _flags = parse_args_1.default.parse(process.argv);
exports.config = require('../config.js');
exports.TudeBot = new TudeBotClient({}, exports.config);
function fixReactionEvent(bot) {
    const events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
    };
    bot.on('raw', (event) => __awaiter(this, void 0, void 0, function* () {
        const ev = event;
        // eslint-disable-next-line no-prototype-builtins
        if (!events.hasOwnProperty(ev.t))
            return;
        const data = ev.d;
        const user = yield bot.users.fetch(data.user_id);
        const channel = (yield bot.channels.fetch(data.channel_id)) || (yield user.createDM());
        if (channel.messages.resolve(data.message_id))
            return;
        const message = yield channel.messages.fetch(data.message_id);
        const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        const reaction = message.reactions.get(emojiKey);
        bot.emit(events[ev.t], reaction, user);
    }));
}
//# sourceMappingURL=index.js.map