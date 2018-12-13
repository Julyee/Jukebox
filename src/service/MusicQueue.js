import IBindable from '../core/IBindable';

export class MusicQueue extends IBindable {
    constructor() {
        super();

        this.mQueue = [];
        this.mHistory = [];
        this.mStorageHandle = null; // eslint-disable-line // todo
    }

    destroy() {
        delete this.mQueue;
        delete this.mHistory;
        delete this.mStorageHandle;

        super.destroy();
    }

    get queue() {
        return this.mQueue;
    }

    get history() {
        return this.mHistory;
    }

    get queueSize() {
        return this.mQueue.length;
    }

    get historySize() {
        return this.mHistory.length;
    }

    enqueueSong(song) {
        const toAdd = Array.isArray(song) ? song : [song];
        this.mQueue.push.apply(this.mQueue, toAdd);
    }

    unshiftSong(song) {
        const toAdd = Array.isArray(song) ? song : [song];
        this.mQueue.unshift.apply(this.mQueue, toAdd);
    }

    dequeueSong() {
        if (this.queueSize) {
            return this.mQueue.shift();
        }
        return null;
    }

    peekSong(places = 1) {
        if (places > this.mQueue.length) {
            return null;
        }
        return this.mQueue[places - 1];
    }

    clearQueue() {
        this.mQueue.length = 0;
    }

    clearHistory() {
        this.mHistory.length = 0;
    }

    reset() {
        this.clearHistory();
        this.clearQueue();
    }

    saveToStorage(/* key */) {
        // eslint-disable-line // todo
    }

    loadFromStorage(/* key */) {
        // eslint-disable-line // todo
    }
}
