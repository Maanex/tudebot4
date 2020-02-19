"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const fetch = require('node-fetch');
const nothingEmoji = '<:nothing:491651815679590420>';
const sm1emoji = {
    loading: [
        '<a:sm1c1:660603142710231060>',
        '<a:sm1c2:660603131553644554>',
        '<a:sm1c3:660603123831668787>',
        '<a:sm1c4:660603113601761299>',
        '<a:sm1c5:660603103703334912>',
        '<a:sm1c6:660601810632835114>',
    ],
    static: [
        '<:gold_cookie:660877789192519681>',
        ':gem:',
        '<:donut_cookie:660877788412248084> ',
        '<:square_cookie:660877788118515723> ',
        '<:star_cookie:660877788378824704>',
        ':cookie:',
    ]
};
const sm1template = `[ᴄᴏᴏᴋɪᴇᴡʜᴇᴇʟ]
​ ​ ▽ ​ ​ ​ ​ ​ ▽ ​ ​ ​ ​ ​ ▽
​ %s ​ ​ ​ %s    ​ ​ ​ %s
​ ​ △ ​ ​ ​ ​ ​ △ ​ ​ ​ ​ ​ △`;
const sm2emoji = {
    loading: [
        '<a:sm2d1:660890171109146654>',
        '<a:sm2d2:660890171188969507>',
        '<a:sm2d3:660890170656161852>',
        '<a:sm2d4:660890170937311262>',
        '<a:sm2d5:660890170744242185>',
    ],
    static: [
        ':one:',
        ':two:',
        ':three:',
        ':four:',
        ':five:',
        ':six:',
    ]
};
const sm2template = `|\`🎲 Ｎｉｃｅｒ　Ｄｉｃｅｒ 🎲\`|
​ ​ ​ ​ ​ ​ ​ ​ ┌ :: :: :: :: :: ┐
​ ​ ​ ​ ​ ​ ::%s %s %s %s %s
​ ​ ​ ​ ​ ​ ​ ​ └ :: :: :: :: :: ┘`.split('::').join(nothingEmoji);
const sm3emoji = {
    loading: {
        orange: [
            '<a:sm3o6:660952911118860289>',
            '<a:sm3o5:660952910930116629>',
            '<a:sm3o4:660952911341289493>',
            '<a:sm3o3:660952911500541953>',
            '<a:sm3o2:660952910976253974>',
            '<a:sm3o1:660952911047557152>',
        ],
        blue: [
            '<a:sm3b6:660952911219785763>',
            '<a:sm3b5:660952911244951552>',
            '<a:sm3b4:660952911206940712>',
            '<a:sm3b3:660952911185969182>',
            '<a:sm3b2:660952911194619924>',
            '<a:sm3b1:660952910984773632>',
        ]
    },
    static: {
        orange: [
            ':yellow_square:',
            ':orange_square:',
            ':brown_square:',
        ],
        blue: [
            ':blue_square:',
            ':purple_square:',
            ':red_square:',
        ]
    }
};
const sm3template = `𝘿𝙖𝙣𝙘𝙚𝙢𝙖𝙨𝙩𝙚𝙧
♫ ★​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ♪
​  ♪ ​  ​ ​ %s%s%s
​ ​ ​ ​ ​ ​ ​ %s%s%s​ ​ ♫
​  ★​  ​ %s%s%s
​ ​ ​ ​ ♫ ​ ​​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ♪  ★`;
const sm4template = `**ㄒㄩ尺乃ㄖ匚卄卂尺Ꮆ乇尺**
◢─────────────◣
​ ◖%s %s %s %s %s %s◗
◥─────────────◤`;
const machines = [
    {
        name: 'Cookiewheel',
        ids: ['1', 'cw', 'cookiewheel', 'cookie', 'wheel'],
        entry: 10,
        checkpot: 1000,
        description: 'Get three of a kind to win, get two of a kind for a consolation prize.',
        run: runSm1
    },
    {
        name: 'Nicer Dicer',
        ids: ['2', 'nd', 'nicerdicer', 'nicer', 'dicer'],
        entry: 200,
        checkpot: 100000,
        description: 'Straight in order: CHECKPOT, 100.000\nAll same: BIGPOT, 10.000\n4 of a kind: 1.400\nStraight, not in order: 1.000\nFull House: 999\nTripple: 200\nAll different: 100\nTwo pair: 20\nPair: 10',
        run: runSm2
    },
    {
        name: 'Dancemaster',
        ids: ['3', 'dm', 'dancemaster', 'dance', 'master'],
        entry: 30,
        checkpot: 100000,
        description: 'Full screen one color: CHECKPOT, 100.000\nOnly two colors on screen: win, 300\nThree in a line: consolation prize, 5 each line',
        run: runSm3
    },
];
let cooldown = [];
module.exports = {
    name: 'slotmachine',
    aliases: [
        'sm'
    ],
    desc: 'Sweet game of Slotmachine',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            if (args.length < 1) {
                repl(mes.channel, mes.author, 'slotmachine <machine>', 'bad', 'Available machines:\n1: Cookiewheel\n 2: Nicer Dicer\n 3: Dancemaster\n 4: Turbocharger (currently not available)\n`slotmachine info <machine>` for more info');
                resolve(false);
                return;
            }
            let infoOnly = false;
            if (args[0].toLowerCase() == 'i' || args[0].toLowerCase() == 'info' || args[0].toLowerCase() == 'information')
                infoOnly = true;
            if (infoOnly && args.length < 2) {
                repl(mes.channel, mes.author, 'slotmachine info <machine>', 'bad');
                resolve(false);
                return;
            }
            let machine = undefined;
            out: for (let sm of machines) {
                for (let id of sm.ids)
                    if (args[infoOnly ? 1 : 0].toLowerCase() == id) {
                        machine = sm;
                        break out;
                    }
            }
            if (!machine) {
                repl(mes.channel, mes.author, `Machine ${args[infoOnly ? 1 : 0]} not found!`, 'bad', 'Available machines:\n1: Cookiewheel\n 2: Nicer Dicer\n 3: Dancemaster\n 4: Turbocharger\n`slotmachine info <machine>` for more info');
                resolve(false);
                return;
            }
            if (infoOnly) {
                repl(mes.channel, mes.author, machine.name, 'message', machine.description + '\n\n**Cost:** ' + machine.entry);
                resolve(false);
                return;
            }
            if (cooldown.indexOf(mes.author.id) >= 0) {
                repl(mes.channel, mes.author, `Oh noes! You goin too quick!`, 'bad', `Please wait a bit before using a slotmachine again!`);
                resolve(false);
                return;
            }
            let price = machine.entry;
            tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => {
                if (u.cookies < price) {
                    repl(mes.channel, mes.author, `${machine.name} costs ${machine.entry} to play!`, 'bad', `You only got ${u.cookies} cookies!`);
                    resolve(false);
                    return;
                }
                u.cookies -= price;
                tudeapi_1.default.updateClubUser(u);
                machine.run(mes, u);
                cooldown.push(mes.author.id);
                setTimeout(id => cooldown.splice(cooldown.indexOf(id), 1), 7000, mes.author.id);
                resolve(true);
            }).catch(err => repl(mes.channel, mes.author, 'An error occured!', 'error'));
        });
    }
};
function runSm1(mes, u) {
    let text = sm1template;
    while (text.indexOf('%s') >= 0)
        text = text.replace('%s', sm1emoji.loading[Math.floor(Math.random() * 6)]);
    mes.channel.send({ embed: {
            title: 'Slotmachine',
            color: 0x2f3136,
            description: text
        } }).then(m => {
        setTimeout((m, u) => {
            text = sm1template;
            let slot1 = Math.floor(Math.random() * 6);
            let slot2 = Math.floor(Math.random() * 6);
            let slot3 = Math.floor(Math.random() * 6);
            let wintext = 'No Luck!';
            let prize = 0;
            if (slot1 == slot2 && slot2 == slot3) {
                if (slot1 == 0) {
                    wintext = 'CHECKPOT';
                    prize = 1000;
                }
                else if (slot1 == 1) {
                    wintext = 'GEMPOT';
                    prize = -5;
                }
                else {
                    wintext = 'WINNER';
                    prize = 90;
                }
            }
            else if (slot1 == slot2 || slot2 == slot3 || slot3 == slot1) {
                let slot = slot1;
                if (slot2 == slot3)
                    slot = slot2;
                if (slot == 0) {
                    wintext = 'LUCKY';
                    prize = 40;
                }
                else if (slot == 1) {
                    wintext = 'LUCKY';
                    prize = -1;
                }
                else {
                    wintext = 'CONSOLATION PRIZE';
                    prize = 3;
                }
            }
            text = text.replace('%s', sm1emoji.static[slot1])
                .replace('%s', sm1emoji.static[slot2])
                .replace('%s', sm1emoji.static[slot3]);
            text += `\n**${wintext}:** +${Math.abs(prize)}` + (prize >= 0 ? 'c' : 'g');
            if (prize > 0)
                u.cookies += prize;
            else
                u.gems -= prize;
            tudeapi_1.default.updateClubUser(u);
            m.edit({ embed: {
                    title: 'Slotmachine',
                    color: 0x2f3136,
                    description: text
                } });
        }, 4000, m, u);
    });
}
function runSm2(mes, u) {
    let text = sm2template;
    let c = 0;
    while (text.indexOf('%s') >= 0 && c < 5)
        text = text.replace('%s', sm2emoji.loading[c++]);
    mes.channel.send({ embed: {
            title: 'Slotmachine',
            color: 0x2f3136,
            description: text
        } }).then(m => {
        setTimeout((m, u) => {
            text = sm2template;
            let slots = [
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6)
            ];
            let slotam = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            slots.forEach(s => slotam[s]++);
            let wintext = '- all different -';
            let prize = 100;
            let allSame = false;
            let fourSame = false;
            let tripple = false;
            let pair = false;
            let doublePair = false;
            let straight = slotam[1] == 1 && slotam[2] == 1 && slotam[3] == 1 && slotam[4] == 1;
            for (let i in slotam) {
                if (slotam[i] == 5)
                    allSame = true;
                else if (slotam[i] == 4)
                    fourSame = true;
                else if (slotam[i] == 3)
                    tripple = true;
                else if (slotam[i] == 2) {
                    if (pair == true)
                        doublePair = true;
                    pair = true;
                }
            }
            if (allSame) {
                wintext = '+ ALL SAME +';
                prize = 10000;
            }
            else if (fourSame) {
                wintext = '+ 4 OF A KIND +';
                prize = 1400;
            }
            else if (tripple) {
                if (pair) {
                    wintext = '+ FULL HOUSE +';
                    prize = 999;
                }
                else {
                    wintext = '- tripple -';
                    prize = 200;
                }
            }
            else if (pair) {
                if (doublePair) {
                    wintext = '- two pair -';
                    prize = 20;
                }
                else {
                    wintext = '- one pair -';
                    prize = 10;
                }
            }
            else if (straight) {
                if ((slots[0] == 0 && slots[1] == 1 && slots[2] == 2 && slots[3] == 3 && slots[4] == 4)
                    || (slots[0] == 1 && slots[1] == 2 && slots[2] == 3 && slots[3] == 4 && slots[4] == 5)
                    || (slots[0] == 4 && slots[1] == 3 && slots[2] == 2 && slots[3] == 1 && slots[4] == 0)
                    || (slots[0] == 5 && slots[1] == 4 && slots[2] == 3 && slots[3] == 2 && slots[4] == 1)) {
                    wintext = '+ CHECKPOT +';
                    prize = 100000;
                }
                else {
                    wintext = '- straight not in order -';
                    prize = 1000;
                }
            }
            let sendNudesEasteregg = Math.random() < 0.0001; // 0.01%;
            if (sendNudesEasteregg) {
                text = text.replace('Ｎｉｃｅｒ　Ｄｉｃｅｒ', 'ｓｅｎｄ');
                text = text.replace('%s', ':regional_indicator_n:')
                    .replace('%s', ':regional_indicator_u:')
                    .replace('%s', ':regional_indicator_d:')
                    .replace('%s', ':regional_indicator_e:')
                    .replace('%s', ':regional_indicator_s:');
                wintext = 'winner winner chicken breakfest';
                prize = 69;
            }
            else {
                text = text.replace('%s', sm2emoji.static[slots[0]])
                    .replace('%s', sm2emoji.static[slots[1]])
                    .replace('%s', sm2emoji.static[slots[2]])
                    .replace('%s', sm2emoji.static[slots[3]])
                    .replace('%s', sm2emoji.static[slots[4]]);
            }
            let cap = wintext.startsWith('+') ? '**' : '';
            text += `\n\n|\`${wintext}\`|\n${nothingEmoji} ${cap}+${Math.abs(prize)}` + (prize >= 0 ? 'c' : 'g') + cap;
            if (prize > 0)
                u.cookies += prize;
            else
                u.gems -= prize;
            tudeapi_1.default.updateClubUser(u);
            m.edit({ embed: {
                    title: sendNudesEasteregg ? 'Slutmachine' : 'Slotmachine',
                    color: 0x2f3136,
                    description: text
                } });
        }, 5000, m, u);
    });
}
let sm3blue = [];
function runSm3(mes, u) {
    let goBlue = sm3blue.indexOf(mes.author.id) >= 0;
    let text = sm3template;
    while (text.indexOf('%s') >= 0)
        text = text.replace('%s', sm3emoji.loading[goBlue ? 'blue' : 'orange'][Math.floor(Math.random() * 6)]);
    mes.channel.send({ embed: {
            title: 'Slotmachine',
            color: 0x2f3136,
            description: text
        } }).then(m => {
        setTimeout((m, u) => {
            text = sm3template;
            let slots = [
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 3)
            ];
            let slotam = { 0: 0, 1: 0, 2: 0 };
            slots.forEach(s => slotam[s]++);
            let wintext = nothingEmoji + ' 𝒩𝑜 𝓁𝓊𝒸𝓀';
            let prize = 0;
            let win = false;
            let lines = 0;
            if (slotam[0] == 9 || slotam[1] == 9 || slotam[2] == 9) {
                wintext = nothingEmoji + ' :tada: 𝒞𝒽𝑒𝒸𝓀𝓅𝑜𝓉 :tada:';
                prize = 100000;
                win = true;
            }
            else if (slotam[0] == 0 || slotam[1] == 0 || slotam[2] == 0) {
                wintext = '​ ​ ​ ​ :man_dancing: 𝒲𝒾𝓃 :dancer:';
                prize = 300;
                win = true;
            }
            else {
                out: for (let type of [0, 1, 2]) {
                    let winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
                    conditions: for (let con of winConditions) {
                        for (let digit of con) {
                            if (slots[digit] != type)
                                continue conditions;
                        }
                        lines++;
                    }
                }
            }
            if (lines) {
                wintext = nothingEmoji + ' ' + lines + ' 𝐿𝒾𝓃𝑒';
                if (lines > 1)
                    wintext += '𝓈';
                prize = 5 * lines;
            }
            for (let s of slots)
                text = text.replace('%s', sm3emoji.static[goBlue ? 'blue' : 'orange'][s]);
            text += `\n${wintext}\n${nothingEmoji} ${nothingEmoji} +${Math.abs(prize)}` + (prize >= 0 ? 'c' : 'g');
            if (goBlue && prize > 0) {
                if (win) {
                    text += '\n:blue_square: **Bonus: +100 Cookies!**';
                    prize += 100;
                }
                else {
                    text += '\n:blue_square: **Bonus: double Cookies!**';
                    prize *= 2;
                }
            }
            if (prize > 0)
                u.cookies += prize;
            else
                u.gems -= prize;
            tudeapi_1.default.updateClubUser(u);
            m.edit({ embed: {
                    title: 'Slotmachine',
                    color: 0x2f3136,
                    description: text
                } });
            if (goBlue && !win)
                sm3blue.splice(sm3blue.indexOf(mes.author.id), 1);
            else if (!goBlue && win)
                sm3blue.push(mes.author.id);
        }, 4000 + Math.floor(Math.random() * 3000), m, u);
    });
}
function runSm4(mes, u) {
    mes.reply('This slotmachine is still under construction. Do this again to loose another 90 cookies!');
}
//# sourceMappingURL=slotmachine.js.map