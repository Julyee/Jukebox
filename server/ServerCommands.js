
module.exports = {
    type: {
        SOCKET_READY: 'Command::SocketReady',
        GET_OWN_ALIAS: 'Command::GetOwnAlias',
        SEND_MESSAGE_TO_TARGET: 'Command::SendMessageToTarget',
    },
    error: {
        INVALID_TARGET_ID: 0,
        TARGET_EVENT_NOT_SPECIFIED: 1,
    },
};
