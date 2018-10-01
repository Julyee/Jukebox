import {LargeThumbnailCard} from './LargeThumbnailCard';

export class PlaylistCard extends LargeThumbnailCard {
    view(vnode) {
        return this._getContent(vnode.attrs.playlist, vnode.attrs.size);
    }

    _getContent(playlist, size = 180) {
        const info = playlist.attributes;
        const artworkSize = (size * window.devicePixelRatio).toString();
        const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkSize).replace('{h}', artworkSize);
        return super._getContent(info.name, info.curatorName, artworkURL, info.contentRating === 'explicit');
    }
}
