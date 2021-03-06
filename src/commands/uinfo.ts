import { User, TextChannel } from 'discord.js'
import TudeApi from '../thirdparty/tudeapi/tudeapi'
import ParseArgs from '../util/parse-args'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class UInfoCommand extends Command {

  constructor() {
    super({
      name: 'uinfo',
      description: 'Userinfo',
      groups: [ 'club', 'internal' ],
      hideOnHelp: true
    })
  }

  public async execute(channel: TextChannel, orgUser: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    const cmdl = ParseArgs.parse(args)
    let user = orgUser
    if (event.message.mentions.users.size)
      user = event.message.mentions.users.first()

    if (cmdl['?'] || cmdl.help || cmdl._ === '?' || cmdl._ === 'help') {
      channel.send(`\`\`\`Options:
           --help  -?    shows this help page
--inventory --inv  -i    renders out the inventory
         --hidden  -h    shows hidden fields (like _org_ or _raw_)
            --all  -a    shows all fields (-i and -h combined)
\`\`\``)
    }

    try {

      const u = await ((user === orgUser && cmdl._) ? TudeApi.clubUserById(cmdl._ as string) : TudeApi.clubUserByDiscordId(user.id/*, orgUser */)) // Don't create a new profile on loopup

      if (!u || u.error) {
        repl('User not found!', 'message', 'Or internal error, idk')
        return false
      }

      const out = JSON.parse(JSON.stringify(u))

      if (!cmdl.h && !cmdl.hidden && !cmdl.all && !cmdl.a) {
        for (const index in out) {
          if (index.charAt(0) === '_')
            delete out[index]
        }
      }

      if (!cmdl.i && !cmdl.inv && !cmdl.inventory && !cmdl.all && !cmdl.a) {
        out.inventory = '.array.'
        if (out._raw_inventory)
          out._raw_inventory = '.array.'
      }

      let str = '```json\n' + JSON.stringify(out, null, 2) + '```'
      str = str.split('".array."').join('[ ... ]').split('".object."').join('{ ... }')
      if (str.length > 2000) repl('The built message is too long. Consider not showing parts like the inventory or hidden atributes')
      else repl(str)

      return true
    } catch (err) {
      repl('An error occured!', 'bad')
      console.error(err)
      return false
    }
  }

}
