const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const log = require('./logging')('HTTPSServer');

class HTTPSServer {
    constructor(options) {
        this.mOptions = options;
        this.mApp = express();
        this.mServerHTTP = http.createServer(this.mApp);
        this.mServerHTTPS = https.createServer({
            key: fs.readFileSync(path.resolve(__dirname, this.mOptions.key)),
            cert: fs.readFileSync(path.resolve(__dirname, this.mOptions.cert)),
        }, this.mApp);

        this.mApp.use((req, res, next) => {
            if(!req.secure) {
                const host = req.hostname + (this.mOptions.httpsPort === 443 ? '' : `:${this.mOptions.httpsPort}`);
                log(`Upgrading "http://${req.get('host')}${req.baseUrl}" to "https://${host}${req.baseUrl}"`);
                return res.redirect(['https://', host, req.baseUrl].join(''));
            }
            next();
        });

        this.mApp.get('/', function(req, res) {
            res.sendFile(path.resolve(__dirname, '../www/index.html'));
        });

        this.mApp.use(express.static(path.resolve(__dirname, '../www')));
        this.mApp.use(express.static(path.resolve(__dirname, '../dist')));
    }

    get app() {
        return this.mApp;
    }

    get serverHTTP() {
        return this.mServerHTTP;
    }

    get serverHTTPS() {
        return this.mServerHTTPS;
    }

    start() {
        this.mServerHTTP.listen(this.mOptions.httpPort, this.mOptions.host);
        this.mServerHTTPS.listen(this.mOptions.httpsPort, this.mOptions.host);
        log(`Listening for requests at ${this.mOptions.host} on http:${this.mOptions.httpPort} https:${this.mOptions.httpsPort}`)
    }
}

module.exports = HTTPSServer;
