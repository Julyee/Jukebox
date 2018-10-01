import {LargeThumbnailCard} from './LargeThumbnailCard';

export class AlbumCard extends LargeThumbnailCard {
    view(vnode) {
        return this._getContent(vnode.attrs.album, vnode.attrs.size);
    }

    _getContent(album, size = 180) {
        const info = album.attributes;
        const artworkSize = (size * window.devicePixelRatio).toString();
        const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkSize).replace('{h}', artworkSize);
        return super._getContent(info.name, info.artistName, artworkURL, info.contentRating === 'explicit');
    }
}
