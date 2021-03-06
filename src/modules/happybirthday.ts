/* eslint-disable no-undef */
import { TextChannel } from 'discord.js'
import { Module } from '../types/types'
import { TudeBot } from '../index'


export default class HappyBirthdayModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';


  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Happy Birthday', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public onBotReady() {
    this.interval = setInterval(() => this.check(), 1000 * 60 * 60)
    this.check()
  }

  public onDisable() {
    clearInterval(this.interval)
    this.interval = undefined
  }

  private check() {
    const date = new Date()
    const dstr = date.getDate() + '-' + (date.getMonth() + 1)
    if (this.lastDay === dstr) return
    this.lastDay = dstr

    const maxdelay = 0// 1000 * 60 * 60 * 5; // 5h
    setTimeout((daystr, guilds, data) => {
      for (const g of guilds.keys()) {
        const users = []
        for (const user in data[g]) {
          if (data[g][user] === daystr)
            users.push(user)
        }
        if (!users.length) return
        const usrstr = users.map(u => `<@${u}>`).join(' & ')
        const msg = this.lang(
          users.length > 1
            ? data[g].lang_mult
            : data[g].lang_one,
          { user: usrstr }
        )

        const guild = TudeBot.guilds.resolve(g)
        if (!guild) continue
        const channel = guild.channels.resolve(guilds.get(g).channel)
        if (!channel || channel.type !== 'text') continue;
        (channel as TextChannel).send(`@everyone ${msg}`)
      }
    }, Math.floor(Math.random() * maxdelay * 0), dstr, this.guilds, this.data)
  }

}
