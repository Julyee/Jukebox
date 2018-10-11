export class Song {
    constructor(songDesc, service) {
        this.mID = null;
        this.mName = null;
        this.mAlbum = null;
        this.mArtist = null;
        this.mArtworkURL = null;
        this.mArtworkSize = null;
        this.mComposer = null;
        this.mIsExplicit = false;
        this.mDuration = null;
        this.mFormattedDuration = null;
        this.mReleaseDate = null;
        this.mGenres = null;
        this._mDescriptor = songDesc;
        this._mService = service;
    }

    get id() {
        return this.mID;
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

    get isExplicit() {
        return this.mIsExplicit;
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

    get service() {
        return this._mService;
    }

    equals(otherSong) {
        return this === otherSong;
    }

    formatArtworkURL(/* width, height */) {
        return this.mArtworkURL;
    }

    async play() {
        this._mService.play(this);
    }
}
