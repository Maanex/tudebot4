/* eslint-disable */
// import { MessageReaction, User, Message, TextChannel } from 'discord.js'
// import { TudeBot } from '../..'
// import TudeApi from '../../thirdparty/tudeapi/tudeapi'
// import { Module } from '../../types/types'
// import Emojis from '../../int/emojis'
// // TODO ALL OF THIS HERE SHIT
// export default class QuotesModule extends Module {
//   constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
//     super('Channel Games', 'private', conf, data, guilds, lang)
//   }
//   public onEnable() {
//     TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
//       if (user.bot) return
//       if (!reaction.message.guild) return
//     })
//     TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
//       if (user.bot) return
//       if (!reaction.message.guild) return
//     })
//     for (const game in games)
//       games[game](this.conf[game], this.data, this.lang)
//   }
//   public onBotReady() {
//   }
//   public onDisable() {
//     for (const game in games) {
//       if (game.onDisable)
//         game.onDisable()
//     }
//   }
// }
// const games = {
//   fishing: (conf: any, data: any, lang: Function) => {
//     interface Player {
//       user: User;
//       idleremovetimer: NodeJS.Timeout;
//       bait?: BaitType;
//       bait_itemname?: string;
//     }
//     interface Fish {
//       type: FishType;
//       name: string;
//       size: number;
//       worth: number;
//       rarity: string;
//     }
//     type FishType = 'angelfish' | 'blowfish' | 'NAMEHERE' | 'crab' | 'squid' | 'shell' | 'frog' | 'shrimp' | 'trout' | 'carp' | 'rainbow_trout' | 'salmon';
//     type SpawnArea = 'regular' | 'bait-only' | 'gold-bait-only';
//     type BaitType = 'regular' | 'gold' | 'mystic' | 'treasure';
//     const emojis = {
//       wave: '<:wv:664896117963620395>',
//       lbwave: '<:rl:665184934947848202>',
//       rbwave: '<:rr:665184935048642570>',
//       rod: '🎣',
//       zerowidth: '​',
//       bait: {
//         regular: ':use_regular_bait:667784099037052931',
//         gold: ':use_gold_bait:667786302674042901',
//         mystic: ':use_mystic_bait:667786936395759646',
//         treasure: ':use_treasure_bait:667807893290090516'
//       },
//       angelfish: [ '<:wf1:664896117690990610>' ],
//       blowfish: [ '<:wf2:664896118089449473>' ],
//       NAMEHERE: [ '<:wf3:664896117200388146>' ],
//       crab: [ '<:wf4:664896117829533716>' ],
//       squid: [ '<:wf5:664896117447589891>' ],
//       shell: [ '<:wf6:664908411850326046>' ],
//       frog: [ '<:wf7:664908412139733005>' ],
//       shrimp: [ '<:wf8:664908412920004659>' ],
//       trout: [ '<:wf9:664908413171400732>' ],
//       carp: [ '<:wf10:664908413028925440>' ],
//       rainbow_trout: [ '<:wf11:664908413087514632>' ],
//       salmon: [ '<:wf12:664908412554838036>' ],
//       inlineBounds: {
//         normalBait: [ '<:bo1:665186063274475540>', '<:bo2:664896118169272330>', '<:bo3:664896118663938078>', '<:bo4:664896117758230554>', '<:bo5:664896117644722209>', '<:bo6:664896118265479207>', '<:bo7:664896117716156437>', '<:bo8:665186063433859072>' ],
//         goldBait: [ '<:bb1:665186062431420447>', '<:bb2:664896118114746379>', '<:bb3:664896117997043753>', '<:bb4:664896118055895040>', '<:bb5:664896118504816640>', '<:bb6:664896117938585613>', '<:bb7:664896118651486251>', '<:bb8:665186062892531732>' ],
//         title: [ '<:t1:665189987024633856>', '<:t2:665189986949267486>', '<:t3:665189986496413728>', '<:t4:665189986894610452>', '<:t5:665189986890416168>', '<:t6:665189986995273758>', '<:t7:665189986928427038>', '<:t8:665189986932490242>' ]
//       }
//     }
//     let messages: Message[] = []
//     const messagesIds: string[] = []
//     let emptyWaveText: string = ''
//     let ticktimer: NodeJS.Timeout
//     let resetDisplayTimer: NodeJS.Timeout
//     const playing: Map<string, Player> = new Map()
//     let timeSinceLastFish: number = 0
//     let currentFish: Fish | null = null
//     let caughtBy: string[] = []
//     let caughtByNames: string[] = []
//     function findMessages(): Promise<void> {
//       return new Promise((resolve, reject) => {
//         const path = conf.channel.split('/');
//         (TudeBot.guilds.get(path[0]).channels.get(path[1]) as TextChannel).fetchMessages().then((mes) => {
//           mes.forEach((m) => {
//             if (conf.messages.includes(m.id)) {
//               messages.push(m)
//               messagesIds.push(m.id)
//             }
//           })
//           messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
//           resolve()
//         }).catch(reject)
//       })
//     }
//     function resetMessages(): Promise<void> {
//       return new Promise(async (resolve, reject) => {
//         let raw = emojis.lbwave
//         for (let i = 0; i < 6; i++)
//           raw += emojis.wave
//         raw += emojis.rbwave + Emojis.BIG_SPACE
//         emptyWaveText = raw
//         let c = 0
//         const title = emojis.inlineBounds.title.join('') + Emojis.BIG_SPACE
//         const border1 = emojis.inlineBounds.goldBait.join('') + Emojis.BIG_SPACE
//         const border2 = emojis.inlineBounds.normalBait.join('') + Emojis.BIG_SPACE
//         for (const m of messages) {
//           let text = ''
//           if (++c == 1) text = title
//           else if (c == 4) text = border1
//           else if (c == 7) text = border2
//           else if (c == 11) text = '`                                                   `\n`                                                   `*' + Emojis.BIG_SPACE + Emojis.BIG_SPACE + '*'
//           else text = raw
//           if (m.content !== text)
//             await m.edit(text)
//         }
//         resolve()
//       })
//     }
//     function resetReactions(): Promise<void> {
//       return new Promise(async (resolve, reject) => {
//         messages[messages.length - 1].clearReactions()
//         setTimeout(() => {
//           let c = 0
//           for (const emoji of [ emojis.rod, ...Object.values(emojis.bait) ])
//             setTimeout(() => messages[messages.length - 1].react(emoji), c++ * 1_000)
//           resolve()
//         }, 2_000)
//       })
//     }
//     async function init() {
//       await findMessages()
//       await resetMessages()
//       await resetReactions()
//       ticktimer = setInterval(tick, 1_000)
//     }
//     TudeBot.on('ready', init)
//     TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
//       if (user.bot) return
//       if (!messagesIds.includes(reaction.message.id)) return
//       if (reaction.emoji.name == emojis.rod) {
//         if (!playing.has(user.id)) {
//           const idleremovetimer = setTimeout(() => forceRemoveUser(user), 5 * 60_000)
//           const player: Player = { user, idleremovetimer }
//           playing.set(user.id, player)
//           if (playing.size == 1) // Restart basically
//             timeSinceLastFish = 0
//           parseBait(player, reaction.message)
//         }
//       } else if (false) {
//         // TODO collect fish in inventory here
//       } else {
//         const player = playing.get(user.id)
//         if (!player) return
//         parseBaitName(player, reaction.emoji.name).then((remove) => {
//           if (remove) {
//             reaction.remove(user)
//           } else {
//             for (const r of reaction.message.reactions.values()) {
//               if (r.emoji.name.startsWith('use_')
//                 && r.emoji.id !== reaction.emoji.id
//                 && r.users.get(user.id) !== undefined)
//                 r.remove(user)
//             }
//           }
//         })
//       }
//     })
//     TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
//       if (user.bot) return
//       if (!messagesIds.includes(reaction.message.id)) return
//       if (reaction.emoji.name == emojis.rod) {
//         if (playing.has(user.id)) {
//           catchFish(user)
//           clearTimeout(playing.get(user.id).idleremovetimer)
//           playing.delete(user.id)
//         }
//       } else if (false) {
//         // TODO collect fish in inventory here
//       } else {
//         let reacted = false
//         for (const r of reaction.message.reactions.values()) {
//           if (r.emoji.name.startsWith('use_')
//             && r.users.get(user.id) !== undefined) {
//             reacted = true
//             break
//           }
//         }
//         if (!reacted) {
//           const player = playing.get(user.id)
//           if (player) {
//             player.bait = undefined
//             player.bait_itemname = ''
//           }
//         }
//       }
//     })
//     async function parseBait(player: Player, message: Message): Promise<void> {
//       let found = false
//       for (const r of message.reactions.values()) {
//         if (r.emoji.name.startsWith('use_')
//           && r.users.get(player.user.id) !== undefined) {
//           if (found)
//             r.remove(player.user)
//           else if (await parseBaitName(player, r.emoji.name)) r.remove(player.user)
//           else found = true
//         }
//       }
//     }
//     async function parseBaitName(player: Player, emoji: string): Promise<boolean> {
//       // player.bait = undefined;
//       // player.bait_itemname = '';
//       let bait
//       switch (emoji) {
//         case 'use_regular_bait':
//           bait = 'regular'
//           break
//         case 'use_gold_bait':
//           bait = 'gold'
//           break
//         case 'use_mystic_bait':
//           bait = 'mystic'
//           break
//         case 'use_treasure_bait':
//           bait = 'treasure'
//           break
//       }
//       const u = await TudeApi.clubUserByDiscordId(player.user.id)
//       const itemname = ((bait == 'regular') ? ('lure') : (bait + '_lure'))
//       console.log(itemname)
//       if (u.inventory.get(itemname) && u.inventory.get(itemname).amount > 1) {
//         player.bait = bait
//         player.bait_itemname = itemname
//         return false
//       } else {
//         return true
//       }
//     }
//     function forceRemoveUser(user: User) {
//       playing.delete(user.id)
//       messages[messages.length - 1].reactions.get(emojis.rod).remove(user)
//       if (playing.size == 0)
//         messages[10].edit('`                                                   `\n`                                                   `*' + Emojis.BIG_SPACE + Emojis.BIG_SPACE + '*')
//     }
//     function tick() {
//       if (playing.size == 0) return
//       timeSinceLastFish++
//       const spawn = Math.random() * Math.random() * Math.random() * timeSinceLastFish / 10
//       if (playing.size) console.log(playing.values().next().value.bait)
//       if (spawn < 1) return
//       const possibleBaits: BaitType[] = []
//       for (const player of playing.values())
//         if (!possibleBaits.includes(player.bait)) possibleBaits.push(player.bait)
//       const baitType = Math.random() < 0.5 ? undefined : possibleBaits[Math.floor(Math.random() * possibleBaits.length)]
//       let area: SpawnArea = baitType ? 'gold-bait-only' : 'regular'
//       if (baitType == 'regular') area = 'bait-only'
//       spawnFish(area, baitType)
//       timeSinceLastFish = possibleBaits.length * 4
//     }
//     function catchFish(u: User) {
//       if (caughtBy.includes(u.id)) return
//       if (!currentFish) return
//       caughtBy.push(u.id)
//       caughtByNames.push(u.username)
//       const fish = currentFish
//       TudeApi.clubUserByDiscordId(u.id).then((u) => {
//         let worth = fish.worth
//         if (worth < 0) worth = 0
//         u.cookies += worth
//         u.points += Math.min(worth / 5, 20)
//         TudeApi.updateClubUser(u)
//         // TODO fisch ins inventar hinzufügen
//       }).catch()
//     }
//     function spawnFish(area: SpawnArea, baitType: BaitType) {
//       timeSinceLastFish = 0
//       const fish = generateFish(area, baitType)
//       const position = Math.floor(Math.random() * 6) + 1
//       let text = emojis.lbwave
//       for (let i = 1; i < 7; i++)
//         text += (position == i ? getEmojiForFish(fish) : emojis.wave)
//       text += emojis.rbwave + Emojis.BIG_SPACE
//       let validLines = []
//       switch (area) {
//         case 'regular': validLines = [ 7, 8, 9 ]; break
//         case 'bait-only': validLines = [ 4, 5 ]; break
//         case 'gold-bait-only': validLines = [ 1, 2 ]; break
//       }
//       const message = messages[validLines[Math.floor(Math.random() * validLines.length)]]
//       currentFish = fish
//       caughtBy = []
//       caughtByNames = []
//       message.edit(text).then(() => {
//         setTimeout((fish) => {
//           currentFish = null
//           message.edit(emptyWaveText)
//           const linewidth = '                                                   '
//           let worth = fish.worth as string
//           if (fish.worth == 0) worth = 'nothing'
//           else if (fish.worth < 0) worth = 'absolutely nothing, put it back.'
//           else worth += ' 🍪'
//           const line1 = `Last Fish: ${fish.size}cm ${fish.name} (${fish.rarity}), Worth ${worth}`
//           const line2 = caughtBy.length ? `Caught by: ${caughtByNames.join(', ')}` : 'Caught by nobody.'
//           let total = ''
//           for (const line of [ line1, line2 ]) {
//             for (const s of line.split(' ')) {
//               let space = ''
//               const currlength = total.split('`\n`')[total.split('`\n`').length - 1].length
//               if (currlength + s.length + 1 > linewidth.length) {
//                 for (let i = 0; i < linewidth.length - currlength; i++) space += ' '
//                 total += space + '`\n`' + s
//               } else { total += (currlength == 0 ? '' : ' ') + s }
//             }
//             const currlength = total.split('`\n`')[total.split('`\n`').length - 1].length
//             let space = ''
//             for (let i = 0; i < linewidth.length - currlength; i++) space += ' '
//             total += space + '`\n`'
//           }
//           messages[10].edit('`' + total.substring(0, total.length - 4) + ' `' + Emojis.BIG_SPACE + Emojis.BIG_SPACE)
//           caughtBy = []
//           caughtByNames = []
//           clearTimeout(resetDisplayTimer)
//           resetDisplayTimer = setTimeout(() => {
//             messages[10].edit('`                                                   `\n`                                                   `*' + Emojis.BIG_SPACE + Emojis.BIG_SPACE + '*')
//           }, 20_000)
//         }, 2_000 + Math.floor(Math.random() * Math.random() * 4_000), fish)
//       })
//     }
//     function generateFish(area: SpawnArea, baitType: BaitType): Fish {
//       let type: FishType, name: string, size: number, worth: number, rarity: string
//       const selectType = () => {
//         const allRarities = {
//           no_bait: {
//             angelfish: 40,
//             blowfish: 20,
//             NAMEHERE: 0,
//             crab: 10,
//             squid: 10,
//             shell: 10,
//             frog: 1,
//             shrimp: 10,
//             trout: 30,
//             carp: 40,
//             rainbow_trout: 5,
//             salmon: 30
//           },
//           regular: {
//             angelfish: 10,
//             blowfish: 20,
//             NAMEHERE: 0,
//             crab: 15,
//             squid: 15,
//             shell: 15,
//             frog: 1,
//             shrimp: 15,
//             trout: 15,
//             carp: 10,
//             rainbow_trout: 10,
//             salmon: 15
//           },
//           gold: {
//             salmon: 1
//           },
//           mystic: {
//             salmon: 1
//           },
//           treasure: {
//             salmon: 1
//           }
//         }
//         const rarities: { [fish: string]: number } = allRarities[baitType || 'no_bait']
//         let total = 0
//         Object.values(rarities).forEach(v => total += v)
//         let selection = Math.floor(Math.random() * total)
//         for (const name in rarities) {
//           type = name as FishType
//           if ((selection -= rarities[name]) <= 0) break
//         }
//       }; selectType()
//       const setSizeAndRarity = () => {
//         switch (type) {
//           case 'angelfish':
//             size = 70 + Math.floor(Math.random() * (150 - 70))
//             rarity = 'common'
//             if (Math.random() < 0.1) size += 10
//             if (Math.random() < 0.1) size += 10
//             if (Math.random() < 0.1) size += 10
//             if (Math.random() < 0.1) size += 10
//             if (Math.random() < 0.1) size += 10
//             if (size > 150) rarity = 'rare'
//             break
//           case 'blowfish':
//             size = 800 + Math.floor(Math.random() * Math.random() * 400)
//             rarity = 'uncommon'
//             break
//           case 'NAMEHERE':
//             size = 0
//             rarity = 'yeet?'
//             break
//           case 'crab':
//             size = 250 + Math.floor(Math.random() * 100)
//             rarity = 'rare'
//             if (Math.random() < 0.01) {
//               size = 1500 + Math.floor(Math.random() * 300)
//               rarity = 'very rare'
//             }
//             break
//           case 'squid':
//             size = 300 + Math.floor(Math.random() * 600)
//             rarity = 'rare'
//             break
//           case 'shell':
//             size = 50 + Math.floor(Math.random() * Math.random() * 100)
//             rarity = 'rare'
//             break
//           case 'frog':
//             size = 50 + Math.floor(Math.random() * Math.random() * 200)
//             rarity = 'questionable'
//             break
//           case 'shrimp':
//             size = 70 + Math.floor(Math.random() * Math.random() * 60)
//             rarity = 'rare'
//             break
//           case 'trout':
//             rarity = 'common'
//           case 'rainbow_trout':
//             rarity = rarity || 'very rare'
//             size = 150 + Math.floor(Math.random() * Math.random() * 350)
//             if (Math.random() < 0.1)
//               size = 150 + Math.floor(Math.random() * Math.random() * 850)
//             break
//           case 'carp':
//             size = 400 + Math.floor(Math.random() * Math.random() * 400)
//             rarity = 'common'
//             break
//           case 'salmon':
//             size = 700 + Math.floor(Math.random() * Math.random() * 700)
//             rarity = 'common'
//             break
//         }
//         size /= 10
//       }; setSizeAndRarity()
//       const determineName = () => {
//         switch (type) {
//           case 'NAMEHERE':
//             name = 'NAMEHERE'
//             break
//           case 'crab':
//             name = 'Crab'
//             if (size > 100) name = 'Red king crab'
//             break
//           case 'rainbow_trout':
//             name = 'Rainbow Trout'
//             break
//           case 'rainbow_trout':
//             name = 'Rainbow Trout'
//             if (size > 500)
//               name = 'Giant Rainbow Trout'
//             break
//           case 'trout':
//             name = 'Trout'
//             if (size > 500)
//               name = 'Giant Trout'
//             break
//           default:
//             name = type[0].toUpperCase() + type.slice(1)
//             break
//         }
//       }; determineName()
//       const calculatePrice = () => {
//         switch (type) {
//           case 'angelfish':
//             if (size < 13) worth = 1
//             if (size < 15) worth = 2
//             else worth = 3
//             break
//           case 'blowfish':
//             if (size < 100) worth = 1
//             else worth = 2
//             break
//           case 'NAMEHERE':
//             worth = 0
//             break
//           case 'crab':
//             if (size < 30) worth = 1
//             if (size < 35) worth = 2
//             else worth = 25
//             break
//           case 'squid':
//             if (size < 50) worth = 1
//             else worth = 2
//             break
//           case 'shell':
//             worth = 0
//             break
//           case 'frog':
//             worth = -1
//             break
//           case 'shrimp':
//             worth = 1
//             break
//           case 'trout':
//             if (size < 35) worth = 1
//             else if (size <= 50) worth = 2
//             else worth = 15
//             break
//           case 'rainbow_trout':
//             if (size <= 50) worth = 30
//             else worth = 100
//             break
//           case 'carp':
//             if (size < 60) worth = 1
//             if (size < 70) worth = 2
//             if (size < 75) worth = 3
//             else worth = 4
//             break
//           case 'salmon':
//             if (size < 100) worth = 1
//             if (size < 120) worth = 2
//             if (size < 130) worth = 3
//             else worth = 4
//             break
//         }
//       }; calculatePrice()
//       return {
//         type,
//         name,
//         size,
//         worth,
//         rarity
//       }
//     }
//     function getEmojiForFish(fish: Fish): string {
//       if (emojis[fish.type]) return emojis[fish.type][Math.floor(Math.random() * emojis[fish.type].length)]
//       else return ':x:' // error
//     }
//     return {
//       onDisable() {
//         messages = []
//         clearInterval(ticktimer)
//       }
//     }
//   },
//   mine: (conf: any, data: any, lang: Function) => {
//   }
// }
//# sourceMappingURL=channelgames.js.map