/* global MusicKit */

import {Song} from '../../media';

export class AppleSong extends Song {
    constructor(songDesc) {
        super(songDesc);

        const info = songDesc.attributes;
        const artworkInfo = this._makeGeneralArtworkInfo(info.artwork);

        this.mName = info.name;
        this.mAlbum = info.albumName;
        this.mArtist = info.artistName;
        this.mArtworkURL = artworkInfo.url;
        this.mArtworkSize = Object.freeze({ width: artworkInfo.width, height: artworkInfo.height });
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

    _makeGeneralArtworkInfo(info) {
        const ret = {};

        if (info.url.indexOf('{w}') !== -1 && info.url.indexOf('{h}') !== -1) {
            ret.url = info.url;

            if (info.hasOwnProperty('width')) {
                ret.width = info.width;
            } else {
                ret.width = 100;
            }

            if (info.hasOwnProperty('height')) {
                ret.height = info.height;
            } else {
                ret.height = 100;
            }
        } else {
            // find the size in the url
            let extension = null;
            let width = null;
            let height = null;
            let baseURL = null;
            for (let i = info.url.length - 1; i >= 0; --i) {
                if (!extension) {
                    if (info.url[i] === '.') {
                        extension = info.url.substring(i);
                    }
                } else if (!height) {
                    if (info.url[i] === 'x') {
                        height = info.url.substring(i + 1, info.url.length - extension.length);
                    }
                } else if (!width) {
                    if (isNaN(info.url[i])) {
                        width = info.url.substring(i + 1, info.url.length - height.length - extension.length - 1);
                        baseURL = info.url.substring(0, i + 1);
                        break;
                    }
                }
            }
            if (!extension || !width || !height || !baseURL || isNaN(width) || isNaN(height)) {
                ret.url = info.url;
                ret.width = 100;
                ret.height = 100;
            } else {
                ret.url = `${baseURL}{w}x{h}${extension}`;
                ret.width = parseInt(width, 10);
                ret.height = parseInt(height, 10);
            }
        }

        return ret;
    }
}
