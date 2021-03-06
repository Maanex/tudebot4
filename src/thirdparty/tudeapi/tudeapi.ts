/* eslint-disable camelcase */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable node/handle-callback-err */
import { User as DiscordUser } from 'discord.js'
import fetch from 'node-fetch'
import WCP from '../../thirdparty/wcp/wcp'
import { TudeBot } from '../../index'
import GetPointsModule from '../../modules/getpoints'
import { ItemList } from '../../content/itemlist'
import { badgeEmojiList } from './badgelist'
import { Item, StackableItem, ExpandedItem, ItemPrefab } from './item'


export interface User {
  error: boolean;
  id: string;
  type: number;
  name: string;
  tag: number;
  accounts?: any;
}

export interface ClubUser {
  error: boolean;
  id: string;
  points: number;
  points_month: number;
  level: number;
  level_progress: number;
  cookies: number;
  gems: number;
  keys: number;
  daily: {
    last: Date;
    claimable: boolean;
    streak: number;
  }
  badges: {
    '1': number; '2': number; '3': number;
    '4': number; '5': number; '6': number;
    '7': number; '8': number; '9': number;
  };
  inventory: Map<string, Item>;
  profile: {
    disp_badge: number;
  };
  user: User;
  addItem(item: ItemPrefab, amount?: number, meta?: any): Item | null;
}

type ClubUserPrivateProps = {
  _org_points: number;
  _org_cookies: number;
  _org_gems: number;
  _org_keys: number;
  _org_profile_disp_badge: number;
  _raw_inventory: Map<string, Item>;
}

export interface Badge {
  id: number;
  keyword: string;
  description: string;
  info: string;
  appearance: {
    from: number;
    name: string;
    icon: string;
  }[];
  getAppearance: (level) => {
    from: number;
    name: string;
    icon: string;
    id: number;
    emoji: string;
  };
}

export interface Leaderboard {
  alltime: ClubUser[];
  month: ClubUser[];
  cookies: ClubUser[];
  dailystreak: ClubUser[];
  season: number;
  updated: number;
}

export interface DeprItem {
  id: string;
  ref: string;
  name: string;
  category: { id: string, name: string, namepl: string };
  type: { id: string, name: string, namepl: string };
  amount: number;
  meta: any;
  expanded: boolean;
  tradeable: boolean;
  sellable: boolean;
  purchaseable: boolean;
  icon: string;
}

export type ClubAction = { id: 'claim_daily_reward' }
  | { id: 'transaction', type: 'cookie' | string, amount: number, reciever: string }
  | { id: 'obtain_perks', perks: string }

export default class TudeApi {

  public static get baseurl() {
    return TudeBot.config.thirdparty.tudeapi.baseurl
  }

  public static get key() {
    return TudeBot.config.thirdparty.tudeapi.key
  }

  public static get endpoints() {
    return {
      ping: 'ping/',
      users: 'users/',
      club: {
        users: 'club/users/',
        memes: 'club/memes/',
        badges: 'club/badges/',
        leaderboard: 'club/leaderboard/',
        lang: 'club/lang/',
        items: 'club/items/'
      }
    }
  }

  public static badges: Badge[] = [];

  public static clubLang: any = {};

  //

  public static async init(language: 'en' | 'de'): Promise<void> {
    fetch(this.baseurl + this.endpoints.club.badges, {
      method: 'get',
      headers: { auth: this.key }
    })
      .then(o => o.json())
      .then((o) => {
        this.badges = o
        for (const b of this.badges) {
          b.getAppearance = function (level: number): { from: number; name: string; icon: string; id: number; emoji: string; } {
            let appearance = b.appearance[0]
            let appid = -1
            for (const a of b.appearance) {
              if (a.from <= level)
                appearance = a
              else break
              appid++
            }
            return {
              from: appearance.from,
              name: appearance.name,
              icon: appearance.icon,
              id: appid,
              emoji: badgeEmojiList[b.id][appid]
            }
          }
        }
        WCP.send({ status_tudeapi: '+Connected' })
      })
      .catch((err) => {
        console.error(err)
        WCP.send({ status_tudeapi: '-Connection failed' })
      })
    //

    const langLoaded = () => {
      // fetch(this.baseurl + this.endpoints.club.items, {
      //     method: 'get',
      //     headers: { 'auth': this.key } })
      //     .then(o => o.json())
      //     .then(o => {
      //         for (const i of o) {
      //             // const item: Item = {
      //             //     id: i.id,
      //             //     ref: i.id,
      //             //     name: this.clubLang['item_' + i.id] || i.id,
      //             //     category: { id: i.cat, name: this.clubLang['itemcat_' + (i.cat || 'null')] || '', namepl: this.clubLang['itemcatpl_' + (i.cat || 'null')] || '' },
      //             //     type: { id: i.type, name: this.clubLang['itemtype_' + (i.type || 'null')] || '', namepl: this.clubLang['itemtypepl_' + (i.type || 'null')] || '' },
      //             //     amount: 0,
      //             //     meta: {},
      //             //     expanded: (i.prop & 0b0001) != 0,
      //             //     tradeable: (i.prop & 0b0010) != 0,
      //             //     sellable: (i.prop & 0b0100) != 0,
      //             //     purchaseable: (i.prop & 0b1000) != 0,
      //             //     icon: 'TODO'
      //             // };
      //             // this.items.push(item);
      //         }
      //         resolve();
      //     })
      //     .catch(err => {
      //         console.error(err);
      //         reject();
      //     });
    }
    //

    await fetch(this.baseurl + this.endpoints.club.lang + language, {
      method: 'get',
      headers: { auth: this.key }
    })
      .then(o => o.json())
      .then((o) => {
        this.clubLang = o
        langLoaded()
      })
      .catch((err) => {
        console.error(err)
        langLoaded() // Yes it's not loaded but whatever, they'll have to handle it without a lang file then, I don't care
      })
    //
  }

  public static reload() {
    this.init(this.clubLang._id)
  }

  //

  public static userById(id: string): Promise<User> {
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.users + id, {
        method: 'get',
        headers: { auth: this.key }
      })
        .then(o => o.json())
        .then(o => resolve(o))
        .catch(err => reject(err))
    })
  }

  public static userByDiscordId(id: string, orCreate?: DiscordUser): Promise<User> {
    let status: number
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.users + 'find?discord=' + id, {
        method: 'get',
        headers: { auth: this.key }
      })
        .then((res) => {
          status = res.status
          return res.json()
        })
        .then((o) => {
          if (status === 404 && orCreate) { // No user present
            TudeApi.createNewUser({
              type: 2,
              name: orCreate.username,
              accounts: { discord: orCreate.id }
            }).then(() => {
              resolve(this.userByDiscordId(id))
            }).catch(_err => resolve(o))
          } else { resolve(o) }
        })
        .catch(err => reject(err))
    })
  }

  public static createNewUser(options: { type: number, name: string, email?: string, accounts?: { discord: string } }): Promise<void> {
    let status
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.users, {
        method: 'post',
        body: JSON.stringify(options),
        headers: { auth: this.key, 'Content-Type': 'application/json' }
      })
        .then((res) => {
          status = res.status
          return res.json()
        })
        .then((_o) => {
          if (status === 200) resolve()
          else reject()
        })
        .catch(_err => reject())
    })
  }

  public static clubUserById(id: string): Promise<ClubUser> {
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.club.users + id, {
        method: 'get',
        headers: { auth: this.key }
      })
        .then(o => o.json())
        .then((o) => {
          if (o) {
            o._raw_inventory = o.inventory
            o.inventory = new Map()
            for (const ref in o._raw_inventory)
              o.inventory.set(ref, this.parseItem(ref, o._raw_inventory[ref]))

            o._raw_daily = o.daily
            o.daily = this.parseClubUserDailyData(o.daily)
            this.mountClubUserFunctions(o)

            o._org_points = o.points || 0
            o._org_cookies = o.cookies || 0
            o._org_gems = o.gems || 0
            o._org_keys = o.keys || 0
            o._org_profile_disp_badge = o.profile && o.profile.disp_badge
          }
          resolve(o)
        })
        .catch(err => reject(err))
    })
  }

  public static clubUserByDiscordId(id: string, orCreate?: DiscordUser): Promise<ClubUser> {
    let status: number
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.club.users + 'find?discord=' + id, {
        method: 'get',
        headers: { auth: this.key }
      })
        .then((res) => {
          status = res.status
          return res.json()
        })
        .then((o) => {
          if (status === 404 && orCreate) { // No user present
            TudeApi.createNewUser({
              type: 2,
              name: orCreate.username,
              accounts: { discord: orCreate.id }
            }).then(() => {
              resolve(this.clubUserByDiscordId(id))
            }).catch(_err => resolve(o))
          } else {
            if (o) {
              o._raw_inventory = o.inventory
              o.inventory = new Map<string, Item>()
              for (const ref in o._raw_inventory)
                o.inventory.set(ref, this.parseItem(ref, o._raw_inventory[ref]))

              o._raw_daily = o.daily
              o.daily = this.parseClubUserDailyData(o.daily)

              this.mountClubUserFunctions(o)

              o._org_points = o.points || 0
              o._org_cookies = o.cookies || 0
              o._org_gems = o.gems || 0
              o._org_keys = o.keys || 0
              o._org_profile_disp_badge = o.profile && o.profile.disp_badge
            }
            resolve(o)
          }
        })
        .catch(err => reject(err))
    })
  }

  private static parseClubUserDailyData(rawDaily: any): { last: Date, claimable: boolean, streak: number } {
    if (!rawDaily) return { last: new Date(0), claimable: true, streak: 0 }

    const daynum: number = rawDaily.last
    const date = new Date((daynum >> 9) + 2000, (daynum >> 5) & 0b1111, daynum & 0b11111)
    const delta = new Date().getTime() - date.getTime()
    const today = delta <= 86400000
    const yesterday = delta >= 86400000 && delta <= 86400000 * 2
    return {
      last: date,
      claimable: !today,
      streak: (today || yesterday) ? rawDaily.streak : 0
    }
  }

  private static mountClubUserFunctions(u: ClubUser) {
    u.addItem = (item: ItemPrefab, amount?: number, meta?: any) => {
      if (amount === undefined) amount = 1
      let itemi: Item = null
      if (item._isDef) {
        switch (item.id) {
          case 'cookie':
            u.cookies += amount
            itemi = item.create(u.cookies)
            break
          case 'gem':
            u.gems += amount
            itemi = item.create(u.gems)
            break
          case 'key':
            u.keys += amount
            itemi = item.create(u.keys)
            break
          default: return null
        }
      } else if (u.inventory.has(item.id)) {
        if (item.expanded)
          return null

        itemi = u.inventory.get(item.id)
        itemi.amount += amount
      } else {
        const itemInstance: Item = item.expanded ? new item.Class(item, item.id, meta || {}) : new item.Class(item, amount)
        u.inventory.set(item.id, itemInstance)
        itemi = itemInstance
      }
      return itemi
    }
  }

  public static badgeById(id: number): Badge {
    return this.badges.find(b => b.id === id)
  }

  public static badgeByKeyword(keyword: string): Badge {
    return this.badges.find(b => b.keyword === keyword.toLowerCase())
  }

  public static badgeBySearchQuery(search: string): Badge {
    return this.badges.find((b: Badge) => (
      b.description.toLowerCase().includes(search.toLowerCase())
        || b.info.toLowerCase().includes(search.toLowerCase())
        || b.getAppearance(0).name.toLowerCase().includes(search.toLowerCase())
    ))
  }

  public static clubLeaderboard(): Promise<Leaderboard> {
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.club.leaderboard, {
        method: 'get',
        headers: { auth: this.key }
      })
        .then(o => o.json())
        .then(o => resolve(o))
        .catch(err => reject(err))
    })
  }

  public static updateUser(user: User) {
    fetch(this.baseurl + this.endpoints.users + user.id, {
      method: 'put',
      body: JSON.stringify(user),
      headers: { auth: this.key, 'Content-Type': 'application/json' }
    })
  }

  public static updateClubUser(user: ClubUser) {
    const userObj = user as ClubUser & ClubUserPrivateProps
    const u: any = {}
    u.points = { add: userObj.points - userObj._org_points }
    if (!u.points.add) delete u.points
    u.cookies = { add: userObj.cookies - userObj._org_cookies }
    if (!u.cookies.add) delete u.cookies
    u.gems = { add: userObj.gems - userObj._org_gems }
    if (!u.gems.add) delete u.gems
    u.keys = { add: userObj.keys - userObj._org_keys }
    if (!u.keys.add) delete u.keys

    if (userObj.profile && userObj.profile.disp_badge !== userObj._org_profile_disp_badge)
      u.profile = { disp_badge: userObj.profile.disp_badge }

    const updatedItems: Item[] = []
    if (userObj.inventory) {
      u.inventory = {}
      let ichanges = false
      userObj.inventory.forEach((item, key) => {
        const org = userObj._raw_inventory[key]
        let out = {} as any
        let changes = false
        if (!org) {
          out = {
            amount: item.amount,
            meta: item.metaChanges
          }
          updatedItems.push(item)
          changes = true
        } else if (item.prefab.expanded) {
          if (item.metaChanges) {
            out.meta = item.metaChanges
            updatedItems.push(item)
            changes = true
          }
          if (item.amount === 0) {
            out.amount = 0
            changes = true
          }
        } else {
          if (!org.amount) org.amount = 1
          if (org.amount !== item.amount) {
            out.amount = { add: item.amount - org.amount }
            updatedItems.push(item)
            changes = true
          }
        }
        if (changes) {
          u.inventory[key] = out
          ichanges = true
        }
      })
      if (!ichanges) delete u.inventory
    }
    fetch(this.baseurl + this.endpoints.club.users + userObj.id, {
      method: 'put',
      body: JSON.stringify(u),
      headers: { auth: this.key, 'Content-Type': 'application/json' }
    })
      .then(o => o.json())
      .then((o) => {
        userObj._org_points += u.points ? u.points.add : 0
        userObj._org_cookies += u.cookies ? u.cookies.add : 0
        userObj._org_gems += u.gems ? u.gems.add : 0
        userObj._org_keys += u.keys ? u.keys.add : 0
        userObj._org_profile_disp_badge = u.profile && u.profile.disp_badge
        if (o.levelup !== undefined)
          TudeBot.getModule<GetPointsModule>('getpoints').onUserLevelup(userObj, o.levelup.level, o.levelup)
        if (o.items) {
          for (const id of o.items) {
            if (!updatedItems.length) break
            updatedItems[0].id = id
            updatedItems.splice(0, 1)
          }
        }
      })
      .catch(console.error)
  }

  public static performClubUserAction(user: ClubUser, action: ClubAction): Promise<any> {
    return this.performClubUserActionRaw(user.id, action)
  }

  public static performClubUserActionRaw(query: string, action: ClubAction): Promise<any> {
    let status: number
    return new Promise((resolve, reject) => {
      fetch(this.baseurl + this.endpoints.club.users + query, {
        method: 'post',
        body: JSON.stringify(action),
        headers: { auth: this.key, 'Content-Type': 'application/json' }
      })
        .then((res) => {
          status = res.status
          return res.json()
        })
        .then((o) => {
          if (status === 200) resolve(o)
          else reject(o)
        })
        .catch((err) => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          reject()
        })
    })
  }

  public static parseItem(ref: string, item: any): Item {
    const id = item.id || ref
    const amount = item.amount === undefined ? 1 : item.amount
    const meta = item.meta === undefined ? {} : item.meta

    const prefab = ItemList.find(i => i.id === id)

    if (!prefab) {
      console.error(`No item prefab found for ${id}!`)
      return undefined
    }

    let instance: Item = null
    if (prefab.parse) {
      const nitem = JSON.parse(JSON.stringify(item))
      nitem.type = nitem.id
      nitem.id = ref
      instance = prefab.parse(nitem)
    } else if (prefab.Class.prototype instanceof StackableItem) {
      instance = new prefab.Class(prefab, amount)
    } else if (prefab.Class.prototype instanceof ExpandedItem) {
      instance = new prefab.Class(prefab, ref, meta)
    } else {
      instance = new prefab.Class(prefab, ref, amount, meta)
    }

    return instance
  }

}
