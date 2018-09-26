import {IBindable} from '../core/IBindable';
import {MediaManager} from './MediaManager';

const instanceMap = {};
let activeService = null;

export class Service extends IBindable {
    static instance() {
        if (!instanceMap[this.name]) {
            instanceMap[this.name] = new this();
        }
        return instanceMap[this.name];
    }

    static activeService(service) {
        if (arguments.length === 1) {
            activeService = service;
        }
        return activeService;
    }

    constructor() {
        super();
        this.mMediaManager = new MediaManager();
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
