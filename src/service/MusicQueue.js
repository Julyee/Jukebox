import IBindable from '../core/IBindable';

export class MusicQueue extends IBindable {
    constructor() {
        super();

        this.mQueue = [];
        this.mHistory = [];
        this.mStorageHandle = null; // todo
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
        this.mQueue.push(song);
    }

    unshiftSong(song) {
        this.mQueue.unshift(song);
    }

    dequeueSong() {
        if (this.queueSize) {
            const ret = this.mQueue.shift();
            this.mHistory.push(ret);
            return ret;
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
        // todo
    }

    loadFromStorage(/* key */) {
        // todo
    }
}
