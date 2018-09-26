
export class Song {
    constructor(songDesc) {
        this.mName = null;
        this.mAlbum = null;
        this.mArtist = null;
        this.mArtworkURL = null;
        this.mArtworkSize = null;
        this.mComposer = null;
        this.mRating = null;
        this.mDuration = null;
        this.mFormattedDuration = null;
        this.mReleaseDate = null;
        this.mGenres = null;
        this._mDescriptor = songDesc;
    }

    get name() {
        return this.mName;
    }

    get album() {
        return this.mAlbum;
    }

    get artist() {
        return this.mArtist;
    }

    get artworkURL() {
        return this.mArtworkURL;
    }

    get artworkSize() {
        return this.mArtworkSize;
    }

    get composer() {
        return this.mComposer;
    }

    get rating() {
        return this.mRating;
    }

    get duration() { // raw
        return this.mDuration;
    }

    get formattedDuration() {
        return this.mFormattedDuration;
    }

    get releaseDate() {
        return this.mReleaseDate;
    }

    get genres() {
        return this.mGenres;
    }

    get _descriptor() {
        return this._mDescriptor;
    }

    formatArtworkURL(/* width, height */) {
        return this.mArtworkURL;
    }
}
