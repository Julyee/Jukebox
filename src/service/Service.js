import {IBindable} from '../core/IBindable';

const kInstanceMap = {};
let kActiveService = null;
let kAllConfigured = false;

export class Service extends IBindable {
    static instance(serviceName) {
        if (arguments.length === 1 && kInstanceMap.hasOwnProperty(serviceName)) {
            return kInstanceMap[serviceName];
        }

        if (!kInstanceMap[this.name]) {
            kInstanceMap[this.name] = new this();
        }
        return kInstanceMap[this.name];
    }

    static activeService(service) {
        if (arguments.length === 1) {
            if (service instanceof Service) {
                kActiveService = service;
            } else if (kInstanceMap.hasOwnProperty(service)) {
                return kInstanceMap[service];
            }
        }
        return kActiveService;
    }

    static allConfigured(flag) {
        if (arguments.length === 1) {
            kAllConfigured = flag;
        }
        return kAllConfigured;
    }

    constructor() {
        super();
    }

    get authorized() {
        throw 'Not implemented';
    }

    get bufferingProgress() {
        throw 'Not implemented';
    }

    get playbackProgress() {
        throw 'Not implemented';
    }

    get isPlaying() {
        throw 'Not implemented';
    }

    get currentSong() {
        throw 'Not implemented';
    }

    get audioContext() {
        throw 'Not implemented';
    }

    get audioSource() {
        throw 'Not implemented';
    }

    get canServeJukebox() {
        return true;
    }

    async init() {
        throw 'Not implemented';
    }

    async authorize() {
        throw 'Not implemented';
    }

    async unauthorize() {
        throw 'Not implemented';
    }

    async search() {
        throw 'Not implemented';
    }

    async searchHints() {
        throw 'Not implemented';
    }

    async findSong() {
        throw 'Not implemented';
    }

    async queueSong() {
        throw 'Not implemented';
    }

    async play() {
        throw 'Not implemented';
    }

    async pause() {
        throw 'Not implemented';
    }

    async stop() {
        throw 'Not implemented';
    }

    async next() {
        throw 'Not implemented';
    }

    async previous() {
        throw 'Not implemented';
    }

    async seekTo() {
        throw 'Not implemented';
    }

    async getHomeContent() {
        throw 'Not implemented';
    }

    async getAlbumInfo() {
        throw 'Not implemented';
    }

    async getAlbumForSong() {
        throw 'Not implemented';
    }

    async getPlaylistInfo() {
        throw 'Not implemented';
    }

    async getCurrentSong() {
        return this.currentSong;
    }
}
