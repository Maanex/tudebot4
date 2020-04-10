
import fetch, { Response } from 'node-fetch';


export interface BadoszAPIInitSettings {
  baseurl?: string,
  headers?: any,
}

export interface BadoszAPISteamUser {
  avatar: {
    small: string,
    medium: string,
    large: string
  },
  id: string,
  url: string,
  created: Date,
  last_log_off: Date,
  nickname: string,
  primary_group: string,
  games_owned: {
    name: string,
    id: number,
    play_time: number
  }[]
}

/**
 * API wrapper for api.badosz.com
 * @author Maanex (maanex.tk)
 */
export default class BadoszAPI {

  public static readonly DEFAULT_SETTINGS = {
    baseurl: 'https://api.badosz.com/',
    headers: { },
  }

  public static readonly ENDPOINTS = {
    ant: 'ant',
    bird: 'bird',
    bee: 'bee',
    rabbit: 'rabbit',
    catgirl: 'catgirl',
    cuddle: 'cuddle',
    dog: 'dog',
    feed: 'feed',
    fox: 'fox',
    hug: 'hug',
    jesus: 'jesus',
    kiss: 'kiss',
    pat: 'pat',
    poke: 'poke',
    shibe: 'shibe',
    tickle: 'tickle',
    advice: 'advice',
    cat: 'cat',
    chucknorris: 'chucknorris',
    dadjoke: 'dadjoke',
    fact: 'fact',
    why: 'why',
    yomomma: 'yomomma',
    base64: 'base64',
    binary: 'binary',
    blurple: 'blurple',
    changemymind: 'changemymind',
    color: 'color',
    colorify: 'colorify',
    decodeBase64: 'decode-base64',
    decodeHex: 'decode-hex',
    endpoints: 'endpoints',
    excuseme: 'excuseme',
    flip: 'flip',
    hex: 'hex',
    invert: 'invert',
    morse: 'morse',
    reverse: 'reverse',
    steamUser: 'steam-user',
    trump: 'trump',
    vaporwave: 'vaporwave',
    wanted: 'wanted',
    wasted: 'wasted',
  }

  //

  constructor (
    private token: string,
    private settings?: BadoszAPIInitSettings,
  ) {
    if (!this.settings) {
      this.settings = BadoszAPI.DEFAULT_SETTINGS;
    } else {
      if (!this.settings.baseurl) this.settings.baseurl = BadoszAPI.DEFAULT_SETTINGS.baseurl;
      if (!this.settings.headers) this.settings.headers = BadoszAPI.DEFAULT_SETTINGS.headers;
    }

    this.settings.headers['Authorization'] = token;
  }

  private async makeRequest(endpoint: string, params?: any): Promise<Response> {
    const add = [];
    for (const key in params) add.push(`${key}=${encodeURIComponent(params[key])}`);
    return fetch(this.settings.baseurl + endpoint + (add.length ? `?${add.join('&')}` : ''), {
      method: 'GET',
      headers: this.settings.headers
    });
  }

  //

  public async getAnt(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.ant);
    return res.buffer();
  }

  public async getBird(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.bird);
    return res.buffer();
  }

  public async getBee(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.bee);
    return res.buffer();
  }

  public async getRabbit(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.rabbit);
    return res.buffer();
  }

  public async getCatgirl(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.catgirl);
    return res.buffer();
  }

  public async getCuddle(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.cuddle);
    return res.buffer();
  }
  
  public async getDog(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.dog);
    return res.buffer();
  }

  public async getFeed(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.feed);
    return res.buffer();
  }

  public async getFox(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.fox);
    return res.buffer();
  }

  public async getHug(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.hug);
    return res.buffer();
  }

  public async getJesus(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.jesus);
    return res.buffer();
  }

  public async getKiss(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.kiss);
    return res.buffer();
  }

  public async getPat(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.pat);
    return res.buffer();
  }

  public async getPoke(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.poke);
    return res.buffer();
  }

  public async getShibe(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.shibe);
    return res.buffer();
  }

  public async getTickle(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.tickle);
    return res.buffer();
  }

  public async getAdvice(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.advice);
    return (await res.json()).advice;
  }

  public async getCat(): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.cat);
    return res.buffer();
  }

  public async getCuckNorris(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.chucknorris);
    return (await res.json()).joke;
  }

  public async getDadJoke(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.dadjoke);
    return (await res.json()).joke;
  }

  public async getFact(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.fact);
    return (await res.json()).fact;
  }

  public async getWhy(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.why);
    return (await res.json()).why;
  }

  public async getYoMomma(): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.yomomma);
    return (await res.json()).joke;
  }

  public async toBase64(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.base64, { text: text });
    return (await res.json()).formatted;
  }

  public async toBinary(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.binary, { text: text });
    return (await res.json()).formatted;
  }

  public async makeBlurple(imageUrl: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.blurple, { url: imageUrl });
    return res.buffer();
  }

  public async getChangeMyMind(text: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.changemymind, { text: text });
    return res.buffer();
  }

  public async getColor(color: number | string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.color, {
      hex: ('number' == typeof color) ? (color as number).toString(16).padStart(6, '0') : color
    });
    return res.buffer();
  }

  public async colorify(imageUrl: string, color: number | string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.colorify, {
      url: imageUrl,
      hex: ('number' == typeof color) ? (color as number).toString(16).padStart(6, '0') : color
    });
    return res.buffer();
  }

  public async fromBase64(base64: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.decodeBase64, { text: base64 });
    return (await res.json()).formatted;
  }

  public async fromBinary(binary: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.decodeBase64, { text: binary });
    return (await res.json()).formatted;
  }

  /** @deprecated use BadoszAPI.ENDPOINTS instead */
  public async getEndpoints(): Promise<string[]> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.endpoints);
    return (await res.json()).endpoints;
  }

  public async getExcuseme(text: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.excuseme, { text: text });
    return res.buffer();
  }

  public async flipText(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.flip, { text: text });
    return (await res.json()).formatted;
  }

  public async toHex(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.hex, { text: text });
    return (await res.json()).formatted;
  }

  public async invertImage(imageUrl: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.invert, { url: imageUrl });
    return res.buffer();
  }

  public async toMorseCode(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.morse, { text: text });
    return (await res.json()).formatted;
  }

  public async reverseText(text: string): Promise<string> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.reverse, { text: text });
    return (await res.json()).formatted;
  }

  public async getSteamUser(id: string): Promise<BadoszAPISteamUser> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.steamUser, { id: id });
    const out = await res.json();
    out.created = new Date(out.created * 1000);
    out.last_log_off = new Date(out.last_log_off * 1000);
    return out as BadoszAPISteamUser;
  }

  public async getTrumpTweet(text: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.trump, { text: text });
    return res.buffer();
  }

  public async toVaporwave(text: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.vaporwave, { text: text });
    return (await res.json()).formatted;
  }

  public async getWanted(imageUrl: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.wanted, { url: imageUrl });
    return res.buffer();
  }

  public async getWasted(imageUrl: string): Promise<Buffer> {
    const res = await this.makeRequest(BadoszAPI.ENDPOINTS.wasted, { url: imageUrl });
    return res.buffer();
  }

}