"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
const itemlist_1 = require("../thirdparty/tudeapi/itemlist");
const parseArgs_1 = require("../util/parseArgs");
class ItemInfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'iteminfo',
            description: 'Get generic information about any item',
            groups: ['club', 'info'],
        });
    }
    execute(channel, user, args, event, repl) {
        if (!args[0]) {
            repl('What item are you looking for?', 'bad', 'Type `iteminfo <name>` and replace <name> with the item\'s name!');
            return false;
        }
        let cmdl = parseArgs_1.default.parse(args);
        const item = itemlist_1.findItem(args.join(' '));
        if (cmdl.r || cmdl.raw) {
            repl('```json\n' + JSON.stringify(item, null, 2) + '```');
            return !!item;
        }
        if (!item) {
            repl(`No item by the name ${args.join(' ')} found!`, 'bad');
            return;
        }
        const name = tudeapi_1.default.clubLang['item_' + item.id];
        channel.send({ embed: {
                title: `${item.icon} ${name}`,
                description: `\`${item.id}\``,
                fields: [
                    {
                        name: 'Properties',
                        value: [
                            ['Stackable', !item.expanded],
                            ['Tradeable', item.tradeable],
                            ['Sellable', item.sellable],
                            ['Purchaseable', item.purchaseable],
                        ].map(i => `${i[1] ? '🗹' : '☐'} ${i[0]}`).join('\n'),
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: item.category.namepl || 'Unknown',
                        inline: true
                    },
                    {
                        name: 'Group',
                        value: item.group.namepl || 'Unknown',
                        inline: true
                    }
                ],
                color: 0x2f3136,
                footer: { text: `@${user.tag}` }
            } });
        return !!item;
    }
}
exports.default = ItemInfoCommand;
//# sourceMappingURL=iteminfo.js.map