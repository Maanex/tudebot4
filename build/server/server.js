"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const chalk = require("chalk");
const webhooks_1 = require("./routes/api/webhooks");
const freestuff_1 = require("./routes/api/freestuff");
class Server {
    static start(port) {
        const app = express();
        if (process.env.NODE_ENV !== 'production')
            app.use(morgan('tiny'));
        app.use(helmet());
        app.use(express.json());
        app.use(this.nonJsonBodyErrorHandler());
        app.set('trust proxy', 1);
        app.use('/api', webhooks_1.router);
        app.use('/api', freestuff_1.router);
        const server = http.createServer(app);
        server.listen(port || 8128, () => {
            console.log(`Server listening on port ${chalk.yellowBright(port || 8128)}`);
        });
    }
    static nonJsonBodyErrorHandler() {
        return function (error, _req, res, next) {
            if (error instanceof SyntaxError)
                res.status(400).send('400 Bad Request');
            else
                next();
        };
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map