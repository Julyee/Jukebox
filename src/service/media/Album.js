
export class Album {
    constructor(descriptor, service) {
        this.mID = null;
        this.mName = null;
        this.mArtist = null;
        this.mArtworkURL = null;
        this.mArtworkSize = null;
        this.mReleaseDate = null;
        this.mGenres = null;
        this.mLabel = null;
        this.mSongs = null;
        this.mIsExplicit = false;
        this._mDescriptor = descriptor;
        this._mService = service;
    }

    get id() {
        return this.mID;
    }

    get name() {
        return this.mName;
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

    get releaseDate() {
        return this.mReleaseDate;
    }

    get genres() {
        return this.mGenres;
    }

    get label() {
        return this.mLabel;
    }

    get songs() {
        return this.mSongs;
    }

    get isExplicit() {
        return this.mIsExplicit;
    }

    get _descriptor() {
        return this._mDescriptor;
    }

    get service() {
        return this._mService;
    }

    equals(other) {
        return this === other;
    }

    formatArtworkURL(/* width, height */) {
        return this.mArtworkURL;
    }

    async play() {
        this._mService.play(this);
    }
}
