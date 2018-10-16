import {Album} from '../../media';
import {AppleMediaTools} from './AppleMediaTools';
import {AppleSong} from './AppleSong';

export class AppleAlbum extends Album {
    constructor(descriptor, service) {
        super(descriptor, service);

        const info = descriptor.attributes;
        const artworkInfo = AppleMediaTools.makeGeneralArtworkInfo(info.artwork);

        this.mID = descriptor.id;
        this.mName = info.name;
        this.mArtist = info.artistName;
        this.mArtworkURL = artworkInfo.url;
        this.mArtworkSize = Object.freeze({ width: artworkInfo.width, height: artworkInfo.height });
        this.mReleaseDate = info.releaseDate;
        this.mLabel = info.recordLabel;
        this.mShortDescription = info.editorialNotes && info.editorialNotes.short ? info.editorialNotes.short : null;
        this.mLongDescription = info.editorialNotes && info.editorialNotes.standard ? info.editorialNotes.standard : this.mShortDescription;
        this.mIsExplicit = info.contentRating === 'explicit';

        if (descriptor.relationships && descriptor.relationships.tracks && descriptor.relationships.tracks.data.length) {
            this.mSongs = descriptor.relationships.tracks.data.map(song => new AppleSong(song, service));
        }

        const genres = [];
        genres.push(...info.genreNames);
        this.mGenres = Object.freeze(genres);
    }

    equals(other) {
        return this.service === other.service &&
            this.id === other.id;
    }

    formatArtworkURL(width, height) {
        return AppleMediaTools.formatArtworkURL(width, height, this);
    }
}
