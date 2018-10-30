import {LargeThumbnailCard} from './LargeThumbnailCard';

export class PlaylistCard extends LargeThumbnailCard {
    view(vnode) {
        return this._getContent(vnode.attrs.playlist, vnode.attrs.size);
    }

    _getContent(playlist, size = 180) {
        const artworkURL = playlist.formatArtworkURL(size, size);
        return super._getContent(playlist.name, playlist.curator, artworkURL, playlist.isExplicit);
    }
}
