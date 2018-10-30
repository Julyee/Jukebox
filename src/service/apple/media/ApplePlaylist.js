import {Playlist} from '../../media/Playlist';
import {AppleMediaTools} from './AppleMediaTools';
import {AppleSong} from './AppleSong';

export class ApplePlaylist extends Playlist {
    constructor(descriptor, service) {
        super(descriptor, service);

        const info = descriptor.attributes;
        const artworkInfo = AppleMediaTools.makeGeneralArtworkInfo(info.artwork);

        this.mID = descriptor.id;
        this.mTitle = info.name;
        this.mSubtitle = info.curatorName;
        this.mArtworkURL = artworkInfo.url;
        this.mArtworkSize = Object.freeze({ width: artworkInfo.width, height: artworkInfo.height });
        this.mModifiedDate = info.lastModifiedDate;
        this.mShortDescription = info.description && info.description.short ? info.description.short : null;
        this.mLongDescription = info.description && info.description.standard ? info.description.standard : this.mShortDescription;
        this.mIsExplicit = info.contentRating === 'explicit';

        if (descriptor.relationships && descriptor.relationships.tracks && descriptor.relationships.tracks.data.length) {
            this.mSongs = descriptor.relationships.tracks.data.map(song => new AppleSong(song, service));
        }

        if (this.mSongs) {
            this.mDuration = 0;
            this.mSongs.forEach(song => {
                this.mDuration += song.duration;
            });
            this.mFormattedDuration = AppleMediaTools.formatMilliseconds(this.mDuration);
        }
    }

    equals(other) {
        return this.service === other.service &&
            this.id === other.id;
    }

    formatArtworkURL(width, height) {
        return AppleMediaTools.formatArtworkURL(width, height, this);
    }
}
