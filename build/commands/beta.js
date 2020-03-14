"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class BetaCommand extends types_1.Command {
    constructor() {
        super({
            name: 'beta',
            description: 'Join the TudeBot Beta program',
            groups: ['info'],
        });
    }
    execute(channel, user, args, event, repl) {
        repl('Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
        return true;
    }
}
exports.default = BetaCommand;
//# sourceMappingURL=beta.js.map