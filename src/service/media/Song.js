
export class Song {
    constructor(songDesc, service) {
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
        this._mService = service;
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

    get _service() {
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
