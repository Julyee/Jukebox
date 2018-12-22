import IBindable from '../core/IBindable';
import {EventCenter} from '../core/EventCenter';

export class MusicQueue extends IBindable {
    constructor() {
        super();

        this.mLyricsQueue = Promise.resolve();
        this.mLyricsCache = {};
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
        // toAdd.forEach(s => {
        //     this.mLyricsQueue = this.mLyricsQueue.then(() => this.lyricsForSong(s));
        // });
    }

    unshiftSong(song) {
        const toAdd = Array.isArray(song) ? song : [song];
        this.mQueue.unshift.apply(this.mQueue, toAdd);
        // toAdd.forEach(s => {
        //     this.mLyricsQueue = this.mLyricsQueue.then(() => this.lyricsForSong(s));
        // });
    }

    dequeueSong() {
        if (this.queueSize) {
            return this.mQueue.shift();
        }
        return null;
    }

    lyricsForSong(song) {
        const key = `${song.name} by ${song.artist}`;
        if (!this.mLyricsCache.hasOwnProperty(key)) {
            this.mLyricsCache[key] = fetch(`Lyrics/${encodeURI(song.name)}/${encodeURI(song.artist)}/${encodeURI(song.duration)}`)
                .then(response => response.json())
                .then(lyrics => {
                    this.mLyricsCache[key] = lyrics;
                    return lyrics;
                });
        }

        return Promise.resolve(this.mLyricsCache[key]);
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
