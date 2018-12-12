const ServerCommands = require('./ServerCommands');
const shortid = require('shortid');
const http = require('http');
const socket = require('socket.io');

const hostname = '0.0.0.0';
const port = 8090;

const app = http.createServer(() => {});
const io = socket(app);

const enableLogging = true;
const log = enableLogging ? console.log : () => {};

const kServerMap = {};

function _logCommand(command, info) {
    log(`Command:${command} with info:${JSON.stringify(info)}`);
}

function _replyWithMessage(fn, message) {
    log(`Result:${JSON.stringify(message)}`);
    fn(message);
}

function _replyWithError(fn, reason) {
    _replyWithMessage(fn, {
        success: false,
        reason: reason,
    });
}

io.use((socket, next) => {
    if (socket.handshake.query.role) {
        if (socket.handshake.query.role === 'client') {
            if (socket.handshake.query.server && kServerMap.hasOwnProperty(socket.handshake.query.server)) {
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

io.on('connection', socket => {
    log(`Connection from ${socket.id} requested as ${socket.handshake.query.role}`);

    socket.on(ServerCommands.type.SEND_MESSAGE_TO_TARGET, (info, fn) => {
        _logCommand('SEND_MESSAGE_TO_TARGET', info);
        if (info && info.event) {
            try {
                let target = null;
                if (kServerMap.hasOwnProperty(info.target)) {
                    target = kServerMap[info.target];
                } else if (io.sockets.connected[info.target]) {
                    target = io.sockets.connected[info.target];
                }

                if (target) {
                    target.emit(info.event, info, response => _replyWithMessage(fn, response));
                } else {
                    throw new Error('Invalid target ID');
                }
            } catch (e) {
                log(e);
                _replyWithError(fn, ServerCommands.error.INVALID_TARGET_ID);
            }
        } else {
            _replyWithError(fn, ServerCommands.error.TARGET_EVENT_NOT_SPECIFIED);
        }
    });

    if (socket.handshake.query.role === 'client') {
        socket.on('disconnect', () => {
            log(`Client disconnected: ${socket.id}`);
        });
        socket.emit(ServerCommands.type.SOCKET_READY, socket.handshake.query.server);
    } else if (socket.handshake.query.role === 'server') {
        let alias;
        do {
            // very unlikely that the alias is duplicated, but check anyway
            alias = shortid.generate();
        } while (kServerMap.hasOwnProperty(alias) && kServerMap[alias] !== socket.id);

        // reserve the alias
        kServerMap[alias] = socket;
        socket.on('disconnect', () => {
            log(`Removing server ${socket.id} and alias ${alias}`);
            delete kServerMap[alias];
        });
        socket.join(alias, () => {
            socket.emit(ServerCommands.type.SOCKET_READY, alias)
        });
    }
});

console.log('Initializing server...');
console.log(`Listening at ${hostname}:${port}`);
app.listen(port, hostname);
