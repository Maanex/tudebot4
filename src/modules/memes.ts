import { TudeBot } from '../index';
import { Message, MessageReaction, User } from 'discord.js';
import { Module } from "../types";
import { DbStats } from '../database/dbstats';


export default class MemesModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Memes', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    TudeBot.on('message', mes => {
      if (!this.isMessageEventValid(mes)) return;
      if (!mes.attachments.size) return;
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return;

      DbStats.getUser(mes.author).then(u => u.memesSent++);

      let emojis = ['⭐', '🔥', '⬆️', '⬇️', '💩'];

      if (` ${mes.content} `.includes(' f '))
        emojis.push(':pay_respect:496359590087098409');

      if (mes.content.match(/doo+t/i))
        emojis.push(':doot:496770649562415115');

      if (mes.content.match(/dank/i))
        emojis.push('🇩', '🇦', '🇳', '🇰');

      for (let me of ['meirl', 'me irl', 'me_irl', 'ichiel', 'ich_iel', 'ich iel']) {
        if (mes.content.toLowerCase().includes(me)) {
          emojis.push(':meirl:496357154199044097');
          break;
        }
      }


      let counter = 0;
      for (let e of emojis)
        setTimeout(() => mes.react(e), counter++ * 500);


      if (Math.floor(Math.random() * 500) == 0) {
        let gif = (["https://cdn.discordapp.com/attachments/497071913718382604/497071937772847104/giphy.gif",
          "https://cdn.discordapp.com/attachments/497071913718382604/497071942323666945/giphy2.gif",
          "https://cdn.discordapp.com/attachments/497071913718382604/497071959595548683/giphy3.gif"])[Math.floor(Math.random() * 3)];
        mes.channel.send({
          embed: {
            color: 0x2f3136,
            image: { url: gif }
          }
        });
      }

      // TODO upload to the tude memes database
      // TODO meme of the month
    });

    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      let mes = reaction.message;
      if (user.bot) return;
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (!this.isEnabledInGuild(mes.guild)) return;
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return;
      if (!mes.attachments.size) return;

      // TODO update database values on up/downvote

      if (reaction.emoji.name == '⭐') {
        user.send({
          embed: {
            color: 0x2f3136,
            image: { url: mes.attachments.first().url },
            description: `[${mes.content || '[link]'}](https://discordapp.com/channels/${mes.guild.id}/${mes.channel.id}/${mes.id})`,
            footer: { text: `Uploaded by ${mes.author.username}` },
            timestamp: mes.createdTimestamp
          }
        });
      }
    });
  }

  public onBotReady(): void {

  }

  public onDisable(): void {

  }

}