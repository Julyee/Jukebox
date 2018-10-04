import {IBindable} from '../core/IBindable';

const kInstanceMap = {};
let kActiveService = null;

export class Service extends IBindable {
    static instance() {
        if (!kInstanceMap[this.name]) {
            kInstanceMap[this.name] = new this();
        }
        return kInstanceMap[this.name];
    }

    static activeService(service) {
        if (arguments.length === 1) {
            kActiveService = service;
        }
        return kActiveService;
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

    get audioContextSource() {
        throw 'Not implemented';
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
}
