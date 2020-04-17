import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, User, TextChannel } from "discord.js";
import * as util from "../util/util";
import { Module } from "../types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import Emojis from "../int/emojis";


export default class ExternalRewardsModule extends Module {
  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('External Rewards', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  public reward(name: string, target: User, messageParams?: any) {
    this.guilds.forEach(async (data, guildid) => {
      const settings = data.rewards[name];
      if (!settings) return;

      if (!TudeBot || !TudeBot.readyAt) return;
      const guild = TudeBot.guilds.get(guildid);
      if (!guild.fetchMember(target)) return;

      const channel = guild.channels.get(settings.channel) as TextChannel;
      if (!channel) return;

      const res = await TudeApi.performClubUserActionRaw(`find?discord=${target.id}`, { id: 'obtain_perks', perks: settings.rewards }) as any;
      const perks = res.perks as string[];
      const message = TudeBot.optionalLang(settings.message, {
        ...messageParams,
        user: target.toString(),
        username: target.username,
        cookies: this.findPerk(perks, 'club.cookies', '0'),
        gems: this.findPerk(perks, 'club.gems', '0'),
        keys: this.findPerk(perks, 'club.keys', '0'),
        points: this.findPerk(perks, 'club.points', '0'),
        cookies_emoji: Emojis.COOKIES,
        gems_emoji: Emojis.GEMS,
        keys_emoji: Emojis.KEYS,
        points_emoji: Emojis.POINTS,
        big_space: Emojis.BIG_SPACE,
      });

      channel.send({ embed: {
        color: 0x2f3136,
        title: message.includes('|') ? message.split('|')[0] : '',
        description: message.includes('|') ? message.split('|')[1] : message
      }});
    });
  }

  private findPerk(perks: string[], name: string, orElse: string): string {
    const perk = perks.find(p => p.startsWith(name + ':'));
    if (!perk) return orElse;
    return perk.split(':')[1];
  }

}