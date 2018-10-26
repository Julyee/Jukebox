import {Song} from '../../media';
import {AppleMediaTools} from './AppleMediaTools';

export class AppleSong extends Song {
    constructor(songDesc, service) {
        super(songDesc, service);

        const info = songDesc.attributes;
        const artworkInfo = AppleMediaTools.makeGeneralArtworkInfo(info.artwork);

        this.mID = songDesc.id;
        this.mTitle = info.name;
        this.mSubtitle = info.artistName;
        this.mDetail = info.albumName;
        this.mArtworkURL = artworkInfo.url;
        this.mArtworkSize = Object.freeze({ width: artworkInfo.width, height: artworkInfo.height });
        this.mComposer = info.composerName;
        this.mIsExplicit = info.contentRating === 'explicit';
        this.mDuration = info.durationInMillis;
        this.mFormattedDuration = AppleMediaTools.formatMilliseconds(info.durationInMillis);
        this.mReleaseDate = info.releaseDate;

        const genres = [];
        genres.push(...info.genreNames);
        this.mGenres = Object.freeze(genres);

        Object.freeze(this);
    }

    equals(otherSong) {
        return this.service === otherSong.service &&
            this.id === otherSong.id;
    }

    formatArtworkURL(width, height) {
        return AppleMediaTools.formatArtworkURL(width, height, this);
    }
}
