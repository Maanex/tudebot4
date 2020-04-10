import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import Emojis from "../int/emojis";


export default class DailyCommand extends Command {

  constructor() {
    super({
      name: 'daily',
      aliases: [ 'd' ],
      description: 'Get your daily reward',
      groups: [ 'club' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      TudeApi.clubUserByDiscordId(user.id, user)
        .then(u => {
          if (!u || u.error) {
            repl('Oopsie!', 'bad', 'Please try that again, thank you');
            resolve(false);
            return;
          }

          TudeApi.performClubUserAction(u, { id: 'claim_daily_reward' }).then(o => {
            let desc = '';

            let reward = o['reward'];
            if (reward.points) desc += `**+${reward.points}** point${reward.points == 1 ? '' : 's'} *${Emojis.POINTS}*\n`;
            if (reward.cookies) desc += `**+${reward.cookies}** cookie${reward.cookies == 1 ? '' : 's'} *${Emojis.COOKIES}*\n`;
            if (reward.gems) desc += `**+${reward.gems}** gem${reward.gems == 1 ? '' : 's'} *${Emojis.GEMS}*\n`;

            let streak = o['streak'];
            if (streak) {
              let prefix = '';
              let suffix = '';
              let bold = streak > 3;

              if (streak >= 7) suffix = '🔥';
              if (streak >= 14) prefix = '🔥';
              if (streak >= 30) {
                prefix = '🔥🔥';
                suffix = '🔥🔥';
              }
              if (streak >= 60) {
                prefix = '(╯°□°)╯';
                suffix = '~(⊙＿⊙\')~';
              }
              if (streak == 69) {
                prefix = '';
                suffix = '- nice';
              }
              if (streak >= 90) {
                prefix = '🐢';
                suffix = '🐢';
              }

              desc += `\n${prefix} ${bold ? '**' : ''}Streak: ${streak} ${streak == 1 ? 'day' : 'days'}${bold ? '**' : ''} ${suffix}`;
            }

            channel.send({
              embed: {
                color: 0x2f3136,
                title: `${event.message.member.displayName}'s daily reward:`,
                description: desc
              }
            });
            resolve(true);
          }).catch(o => {
            repl(o.message || 'An error occured!');
            resolve(false);
          });
        })
        .catch(err => {
          repl('An error occured!', 'bad');
          console.error(err);
          resolve(false);
        })
    });
  }

}
