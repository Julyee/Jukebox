import io from 'socket.io-client';
import ServerCommands from '../../../server/ServerCommands';
import {MediaItem} from '../media/MediaItem';
import {Service} from '../Service';
import * as _AppleMedia from '../apple/media';
import shortid from 'shortid';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents, JukeboxEvents} from '../../frontend/Events';

const AppleMedia = Object.assign({}, _AppleMedia); // fix build warning

const kSignalingEvents = {
    SIGNAL_OFFER: 'Signal::Offer',
    SIGNAL_ICE_CANDIDATE: 'Signal::ICECandidate',
};

const kServiceEvents = {
    PERFORM_METHOD: 'Service::PerformMethod',
    METHOD_RESULT: 'Service::MethodResult',
    MESSAGE_CHUNK: 'Service::Message::Chunk',
    MESSAGE_END: 'Service::Message::End',
    FORWARD_EVENT: 'Service::ForwardEvent',
    SPEAKER_REQUEST_STREAM: 'Service::SpeakerRequestStream',
    SPEAKER_STREAM_RESULT: 'Service::SpeakerStreamResult',
};

export class JukeboxConnection {
    constructor(service) {
        this.mService = service;
        this.mSocket = null;
        this.mSocketReady = false;
        this.mAlias = null;
        this.mIsServer = false;
        this.mIsSpeaker = false;

        this.mConnections = {};
        this.mDataChannels = {};
        this.mMessageQueue = {};

        this._mReplacer = this._replacer.bind(this);
        this._mReviver = this._reviver.bind(this);
    }

    get alias() {
        return this.mAlias;
    }

    get isServer() {
        return this.mIsServer;
    }

    get isSpeaker() {
        return this.mIsSpeaker;
    }

    get connected() {
        return this.mAlias &&
            this.mConnections[this.mAlias] &&
            (this.mConnections[this.mAlias].iceConnectionState === 'connected' || this.mConnections[this.mAlias].iceConnectionState === 'completed') &&
            this.mDataChannels[this.mAlias] &&
            this.mDataChannels[this.mAlias].readyState === 'open';
    }

    async initAsClient(serverAlias) {
        const parsedUrl = new URL(window.location);
        const host = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}?role=client&server=${serverAlias}`;
        return await this._initSocket(host) && await this._connectToServer(serverAlias);
    }

    async initAsSpeaker(serverAlias) {
        if (await this.initAsClient(serverAlias)) {
            if (await this._requestSpeakerStream()) {
                return true;
            }
            Object.keys(this.mDataChannels).forEach(key => { this.mDataChannels[key].onclose = null; });
            Object.keys(this.mConnections).forEach(key => this.mConnections[key].close());
            this.mDataChannels = {};
            this.mConnections = {};
        }
        return false;
    }

    async initAsServer() {
        const parsedUrl = new URL(window.location);
        const host = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}?role=server`;
        this.mIsServer = await this._initSocket(host);
        return this.mSocketReady;
    }

    performMethod(method, ...varArgs) {
        if (!this.isServer) {
            const keys = Object.keys(this.mDataChannels);
            if (keys.length) {
                return new Promise(resolve => {
                    this._sendMessageThroughChannel(this.mDataChannels[keys[0]], {
                        event: kServiceEvents.PERFORM_METHOD,
                        method: method,
                        args: varArgs,
                    }, null, resolve);
                });
            }
        }
        return Promise.resolve(null);
    }

    forwardEvent(event, ...varArgs) {
        Object.keys(this.mDataChannels).forEach(key => this._forwardEvent(this.mDataChannels[key], event, varArgs));
    }

    async _initSocket(host) {
        if (!this.mSocket || !this.mSocketReady) {
            this.mSocket = io(host);
            this._configureSocketEventHandling(this.mSocket);
            await this._waitForSocketConnection(this.mSocket);
        }
        return this.mSocketReady;
    }

    _forwardEvent(channel, event, varArgs) {
        this._sendMessageThroughChannel(channel, {
            event: kServiceEvents.FORWARD_EVENT,
            forwardedEvent: event,
            args: varArgs,
        });
    }

    _waitForSocketConnection(socket) {
        return new Promise(resolve => {
            let cleanup;

            const onError = () => {
                this.mSocket.off();
                this.mSocket.close();
                this.mSocket = null;
                this.mSocketReady = false;
                cleanup();
                resolve();
            };

            const onConnect = () => {
                EventCenter.emit(JukeboxEvents.JUKEBOX_SOCKET_CONNECTED);
                socket.once(ServerCommands.type.SOCKET_READY, alias => {
                    this.mSocketReady = true;
                    this.mAlias = alias;
                    EventCenter.emit(JukeboxEvents.JUKEBOX_SOCKET_READY);
                    cleanup();
                    resolve();
                });
            };

            cleanup = () => {
                socket.off('error', onError);
                socket.off('connect', onConnect);
            };

            socket.on('error', onError);
            socket.on('connect', onConnect);
        });
    }

    _sendCommandThroughSocket(command, info) {
        if (this.mSocket && this.mSocketReady) {
            return new Promise(resolve => {
                this.mSocket.emit(command, info, response => {
                    resolve(response);
                });
            });
        }
        return Promise.resolve();
    }

    _configureSocketEventHandling(socket) {
        socket.on('error', error => {
            console.log(error); // eslint-disable-line
            // this.mSocket.close();
            // if (this.mSocket) {
            //     this.mSocket.off();
            //     this.mSocket = null;
            // }
        });

        socket.on('disconnect', reason => {
            this.mSocketReady = false;
            EventCenter.emit(JukeboxEvents.JUKEBOX_SOCKET_DISCONNECTED);
            if (reason === 'io server disconnect') {
                if (this.mSocket) {
                    this.mSocket.off();
                    this.mSocket = null;
                }
                EventCenter.emit(JukeboxEvents.JUKEBOX_SOCKET_CLOSED);
            } else {
                this._waitForSocketConnection(socket).then(() => {
                    if (this.mSocketReady && !this.isServer) {
                        this._connectToServer(this.mAlias).then(serverResult => {
                            if (serverResult && this.isSpeaker) {
                                this._requestSpeakerStream().then(speakerResult => {
                                    if (speakerResult) {
                                        EventCenter.emit(GeneralEvents.BUTTON_PRESS, Buttons.SPEAKER_START_STREAMING, this);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        socket.on(kSignalingEvents.SIGNAL_ICE_CANDIDATE, (info, fn) => {
            if (this.mConnections[info.source]) {
                this.mConnections[info.source].addIceCandidate(JSON.parse(info.candidate)).then(() => {
                    fn({
                        success: true,
                    });
                }).catch(() => {
                    fn({
                        success: false,
                        reason: 'Could not add ICE candidate',
                    });
                });
            }
        });

        socket.on(kSignalingEvents.SIGNAL_OFFER, (info, fn) => {
            if (this.isServer) {
                const connection = new RTCPeerConnection(null);
                this.mConnections[info.source] = connection;

                this._configureConnectionEvents(connection, info.source, 'server');
            }

            if (this.mConnections[info.source]) {
                this.mConnections[info.source].setRemoteDescription(JSON.parse(info.offer))
                    .then(() => this.mConnections[info.source].createAnswer())
                    .then(answer => this.mConnections[info.source].setLocalDescription(answer))
                    .then(() => {
                        fn({
                            success: true,
                            answer: JSON.stringify(this.mConnections[info.source].localDescription),
                        });
                    }).catch(reason => {
                        console.error(reason); // eslint-disable-line
                        fn({
                            success: false,
                            reason: 'Could not complete the remote/local description sequence',
                        });
                    });
            }
        });
    }

    _configureConnectionEvents(connection, targetID, role) {
        connection.onicecandidate = ({candidate}) => {
            this._sendCommandThroughSocket(ServerCommands.type.SEND_MESSAGE_TO_TARGET, {
                event: kSignalingEvents.SIGNAL_ICE_CANDIDATE,
                role: role,
                source: this.isServer ? this.mAlias : this.mSocket.id,
                target: targetID,
                candidate: JSON.stringify(candidate),
            });
        };

        connection.onnegotiationneeded = () => {
            connection.createOffer()
                .then(offer => connection.setLocalDescription(offer))
                .then(() => this._sendCommandThroughSocket(ServerCommands.type.SEND_MESSAGE_TO_TARGET, {
                    event: kSignalingEvents.SIGNAL_OFFER,
                    role: role,
                    source: this.isServer ? this.mAlias : this.mSocket.id,
                    target: targetID,
                    offer: JSON.stringify(connection.localDescription),
                }))
                .then(response => {
                    if (response.success) {
                        connection.setRemoteDescription(JSON.parse(response.answer));
                    }
                }).catch(reason => {
                    console.error(reason); // eslint-disable-line
                    return null;
                });
        };

        connection.ondatachannel = event => {
            this.mDataChannels[targetID] = event.channel;
            this.mDataChannels[targetID].onmessage = message => this._handleDataChannelMessage(this.mDataChannels[targetID], message);
            this.mDataChannels[targetID].onclose = () => {
                delete this.mDataChannels[targetID];
                delete this.mConnections[targetID];
            };
        };
    }

    _handleDataChannelMessage(dataChannel, message) {
        const data = JSON.parse(message.data);
        switch (data.event) {
            case kServiceEvents.MESSAGE_CHUNK:
                if (!this.mMessageQueue[data.id]) {
                    this.mMessageQueue[data.id] = {
                        message: '',
                        promise: null,
                    };
                }
                this.mMessageQueue[data.id].message += data.message;
                break;

            case kServiceEvents.MESSAGE_END:
                if (!this.mMessageQueue[data.id]) {
                    this.mMessageQueue[data.id] = {
                        message: '',
                        promise: null,
                    };
                }
                this.mMessageQueue[data.id].message += data.message;
                this._handleMessage(dataChannel, data.id);
                break;

            default:
                break;
        }
    }

    _handleMessage(dataChannel, messageID) {
        const message = JSON.parse(decodeURI(this.mMessageQueue[messageID].message), this._mReviver);
        const resolve = this.mMessageQueue[messageID].promise;
        delete this.mMessageQueue[message.id];
        switch (message.event) {
            case kServiceEvents.PERFORM_METHOD:
                if (this.mService) {
                    try {
                        this.mService[message.method](...message.args).then(result => {
                            this._sendMessageThroughChannel(dataChannel, {
                                event: kServiceEvents.METHOD_RESULT,
                                result: result,
                            }, messageID);

                            if (resolve) {
                                resolve(result);
                            }
                        }).catch(reason => {
                            console.error(reason); // eslint-disable-line
                            this._sendMessageThroughChannel(dataChannel, {
                                event: kServiceEvents.METHOD_RESULT,
                                error: reason,
                                result: null,
                            }, messageID);

                            if (resolve) {
                                resolve(null);
                            }
                        });
                    } catch (e) {
                        console.error(e); // eslint-disable-line
                        this._sendMessageThroughChannel(dataChannel, {
                            event: kServiceEvents.METHOD_RESULT,
                            error: `Could no execute method ${message.method}`,
                            result: null,
                        }, messageID);

                        if (resolve) {
                            resolve(null);
                        }
                    }
                } else {
                    this._sendMessageThroughChannel(dataChannel, {
                        event: kServiceEvents.METHOD_RESULT,
                        error: 'Could not find an active service to execute the method',
                        result: null,
                    }, messageID);

                    if (resolve) {
                        resolve(null);
                    }
                }
                break;

            case kServiceEvents.METHOD_RESULT:
                if (message.hasOwnProperty('error')) {
                    console.error(reason); //eslint-disable-line
                }

                if (resolve) {
                    resolve(message.result);
                }
                break;

            case kServiceEvents.FORWARD_EVENT:
                this.mService._handleForwardedEvent(message.forwardedEvent, message.args);
                if (resolve) {
                    resolve();
                }
                break;

            case kServiceEvents.SPEAKER_REQUEST_STREAM: {
                const stream = this.mService._getSpeakerStream();
                const connection = this._getConnectionForDataChannel(dataChannel);

                // let the sender know the result of the request
                this._sendMessageThroughChannel(dataChannel, {
                    event: kServiceEvents.SPEAKER_STREAM_RESULT,
                    result: stream !== null && connection !== null,
                }, messageID);

                // add the stream to the connection
                connection.addStream(stream);

                if (resolve) {
                    resolve(stream !== null && connection !== null);
                }
            }
                break;

            case kServiceEvents.SPEAKER_STREAM_RESULT:
                if (resolve) {
                    resolve(message.result);
                }
                break;

            default:
                break;
        }
    }

    _connectToServer(serverID) {
        return new Promise(resolve => {
            Object.keys(this.mDataChannels).forEach(key => { this.mDataChannels[key].onclose = null; });
            Object.keys(this.mConnections).forEach(key => this.mConnections[key].close());
            this.mDataChannels = {};
            this.mConnections = {};

            const connection = new RTCPeerConnection(null);
            this.mConnections[serverID] = connection;

            this.mDataChannels[serverID] = connection.createDataChannel('Jukebox_by_Julyee');
            this.mDataChannels[serverID].onopen = () => {
                if (this.mDataChannels[serverID].readyState === 'open') {
                    this.mDataChannels[serverID].onmessage = message => this._handleDataChannelMessage(this.mDataChannels[serverID], message);
                    this.mDataChannels[serverID].onopen = null;
                    this.mDataChannels[serverID].onclose = () => {
                        delete this.mDataChannels[serverID];
                        delete this.mConnections[serverID];
                    };
                    resolve(true);
                }
            };
            this._configureConnectionEvents(connection, serverID, 'client');
        });
    }

    _sendMessageThroughChannel(channel, message, id = null, resolve = null) {
        if (channel.readyState === 'open') {
            const str = encodeURI(JSON.stringify(message, this._mReplacer));
            const chunks = str.match(/.{1,10000}/g) || ['null'];

            let messageId = id;
            if (!messageId) {
                do {
                    messageId = shortid.generate();
                } while (this.mMessageQueue.hasOwnProperty(messageId));
            }

            if (resolve) {
                this.mMessageQueue[messageId] = {
                    message: '',
                    promise: resolve,
                };
            }

            for (let i = 0, n = chunks.length; i < n; ++i) {
                channel.send(JSON.stringify({
                    event: i === n - 1 ? kServiceEvents.MESSAGE_END : kServiceEvents.MESSAGE_CHUNK,
                    message: chunks[i],
                    id: messageId,
                }));
            }
        }
    }

    _getConnectionForDataChannel(dataChannel) {
        const keys = Object.keys(this.mDataChannels);
        let id = null;
        for (let i = 0, n = keys.length; i < n; ++i) {
            if (this.mDataChannels[keys[i]] === dataChannel) {
                id = keys[i];
                break;
            }
        }

        if (id && this.mConnections.hasOwnProperty(id)) {
            return this.mConnections[id];
        }

        return null;
    }

    _requestSpeakerStream() {
        if (!this.isServer && this.connected) {
            const keys = Object.keys(this.mDataChannels);
            if (keys.length) {
                const dataChannel = this.mDataChannels[keys[0]];
                const connection = this._getConnectionForDataChannel(dataChannel);

                if (connection) {
                    return new Promise(resolve => {
                        connection.onaddstream = event => {
                            connection.onaddstream = null;
                            this.mIsSpeaker = true;
                            this.mService.mSpeakerStream = event.stream;
                            resolve(true);
                        };

                        connection.onremovestream = () => {
                            // console.log('stream removed!');
                        };

                        const p = new Promise(r => {
                            this._sendMessageThroughChannel(dataChannel, {
                                event: kServiceEvents.SPEAKER_REQUEST_STREAM,
                            }, null, r);
                        });

                        p.then(result => {
                            if (!result) {
                                connection.onaddstream = null;
                                resolve(false);
                            }
                        });
                    });
                }
            }
        }
        return Promise.resolve(false);
    }

    _replacer(key, value) {
        if (value instanceof MediaItem) {
            return {
                __isMediaItem: true,
                className: value.constructor.name,
                descriptor: value._descriptor,
            };
        }
        return value;
    }

    _reviver(key, value) {
        if (value && value.hasOwnProperty('__isMediaItem') && value.__isMediaItem) {
            if (AppleMedia.hasOwnProperty(value.className)) {
                return new AppleMedia[value.className](value.descriptor, Service.activeService());
            }
        }
        return value;
    }
}
