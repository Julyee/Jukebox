export class MediaItem {
    constructor(description, service) {
        this.mID = null;
        this.mTitle = null;
        this.mSubtitle = null;
        this.mDetail = null;
        this.mArtworkURL = null;
        this.mArtworkSize = null;
        this.mIsExplicit = false;

        this._mDescriptor = description;
        this._mService = service;
    }

    get id() {
        return this.mID;
    }

    get title() {
        return this.mTitle;
    }

    get subtitle() {
        return this.mSubtitle;
    }

    get detail() {
        return this.mDetail;
    }

    get artworkURL() {
        return this.mArtworkURL;
    }

    get artworkSize() {
        return this.mArtworkSize;
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

    equals(otherItem) {
        return this === otherItem;
    }

    formatArtworkURL(/* width, height */) {
        return this.mArtworkURL;
    }

    async play() {
        await this._mService.play(this);
    }
}
