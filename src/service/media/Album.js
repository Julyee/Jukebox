import {MediaItem} from './MediaItem';

export class Album extends MediaItem {
    constructor(descriptor, service) {
        super(descriptor, service);
        this.mReleaseDate = null;
        this.mGenres = null;
        this.mLabel = null;
        this.mShortDescription = null;
        this.mLongDescription = null;
        this.mSongs = null;
    }

    get name() {
        return this.title;
    }

    get artist() {
        return this.subtitle;
    }

    get releaseDate() {
        return this.mReleaseDate;
    }

    get genres() {
        return this.mGenres;
    }

    get label() {
        return this.mLabel;
    }

    get shortDescription() {
        return this.mShortDescription;
    }

    get longDescription() {
        return this.mLongDescription;
    }

    get songs() {
        return this.mSongs;
    }
}
