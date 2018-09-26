/* global MusicKit */

import {Song} from '../../media';

export class AppleSong extends Song {
    constructor(songDesc) {
        super(songDesc);

        const info = songDesc.attributes;

        this.mName = info.name;
        this.mAlbum = info.albumName;
        this.mArtist = info.artistName;
        this.mArtworkURL = info.artwork.url;
        this.mArtworkSize = Object.freeze({ width: info.artwork.width, height: info.artwork.height });
        this.mComposer = info.composerName;
        this.mRating = info.contentRating;
        this.mDuration = info.durationInMillis;
        this.mFormattedDuration = MusicKit.formattedMilliseconds(info.durationInMillis);
        this.mReleaseDate = info.releaseDate;

        const genres = [];
        genres.push(...info.genreNames);
        this.mGenres = Object.freeze(genres);

        Object.freeze(this);
    }

    formatArtworkURL(width, height) {
        const artworkInfo = {
            url: this.mArtworkURL,
            width: this.mArtworkSize.width,
            height: this.mArtworkSize.height,
        };
        return MusicKit.formatArtworkURL(artworkInfo, width, height);
    }
}
