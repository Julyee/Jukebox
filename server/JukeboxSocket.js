const ServerCommands = require('./ServerCommands');
const shortid = require('shortid');
const socket = require('socket.io');
const log = require('./logging')('JukeboxSocket');

class JukeboxSocket {
    constructor(server) {
        this.mSocket = socket(server);
        this.mServerMap = {};

        this.mSocket.use((socket, next) => {
            if (socket.handshake.query.role) {
                if (socket.handshake.query.role === 'client') {
                    if (socket.handshake.query.server && this.mServerMap.hasOwnProperty(socket.handshake.query.server)) {
                        return next();
                    } else {
                        return next(new Error('Could not connect to the specified server'));
                    }
                } else if (socket.handshake.query.role === 'server') {
                    return next();
                }
            }

            return next(new Error('Invalid parameters'));
        });

        this.mSocket.on('connection', socket => {
            const address = socket.handshake.address;
            log(`Connection from ${socket.id} (${address}) requested as ${socket.handshake.query.role}`);

            socket.on(ServerCommands.type.SEND_MESSAGE_TO_TARGET, (info, fn) => {
                this._logCommand('SEND_MESSAGE_TO_TARGET', info);
                if (info && info.event) {
                    try {
                        let target = null;
                        if (this.mServerMap.hasOwnProperty(info.target)) {
                            target = this.mServerMap[info.target];
                        } else if (this.mSocket.sockets.connected[info.target]) {
                            target = this.mSocket.sockets.connected[info.target];
                        }

                        if (target) {
                            target.emit(info.event, info, response => this._replyWithMessage(fn, response));
                        } else {
                            throw new Error('Invalid target ID');
                        }
                    } catch (e) {
                        log(e);
                        this._replyWithError(fn, ServerCommands.error.INVALID_TARGET_ID);
                    }
                } else {
                    this._replyWithError(fn, ServerCommands.error.TARGET_EVENT_NOT_SPECIFIED);
                }
            });

            if (socket.handshake.query.role === 'client') {
                socket.on('disconnect', () => {
                    log(`Client disconnected: ${socket.id} (${address})`);
                });
                socket.emit(ServerCommands.type.SOCKET_READY, socket.handshake.query.server);
            } else if (socket.handshake.query.role === 'server') {
                let alias;
                do {
                    // very unlikely that the alias is duplicated, but check anyway
                    alias = shortid.generate();
                } while (this.mServerMap.hasOwnProperty(alias) && this.mServerMap[alias] !== socket.id);

                // reserve the alias
                this.mServerMap[alias] = socket;
                socket.on('disconnect', () => {
                    log(`Removing server ${socket.id} (${address}) and alias ${alias}`);
                    delete this.mServerMap[alias];
                });
                socket.join(alias, () => {
                    socket.emit(ServerCommands.type.SOCKET_READY, alias)
                });
            }
        });
    }

    _logCommand(command, info) {
        log(`Command:${command} with info:${JSON.stringify(info)}`);
    }

    _replyWithMessage(fn, message) {
        log(`Result:${JSON.stringify(message)}`);
        fn(message);
    }

    _replyWithError(fn, reason) {
        this._replyWithMessage(fn, {
            success: false,
            reason: reason,
        });
    }
}

module.exports = JukeboxSocket;
