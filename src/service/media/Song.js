import {MediaItem} from './MediaItem';

export class Song extends MediaItem {
    constructor(description, service) {
        super(description, service);
        this.mComposer = null;

        this.mReleaseDate = null;
        this.mGenres = null;
    }

    get name() {
        return this.title;
    }

    get artist() {
        return this.subtitle;
    }

    get album() {
        return this.detail;
    }

    get composer() {
        return this.mComposer;
    }

    get releaseDate() {
        return this.mReleaseDate;
    }

    get genres() {
        return this.mGenres;
    }
}
