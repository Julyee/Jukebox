import {MediaItem} from './MediaItem';

export class Playlist extends MediaItem {
    constructor(descriptor, service) {
        super(descriptor, service);

        this.mModifiedDate = null;
        this.mShortDescription = null;
        this.mLongDescription = null;
        this.mSongs = null;
    }

    get name() {
        return this.title;
    }

    get curator() {
        return this.subtitle;
    }

    get lastModifiedDate() {
        return this.mModifiedDate;
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
