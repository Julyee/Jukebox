import {LargeThumbnailCard} from './LargeThumbnailCard';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents} from '../Events';

export class AlbumCard extends LargeThumbnailCard {
    view(vnode) {
        return this._getContent(vnode.attrs.album, vnode.attrs.size);
    }

    _getContent(album, size = 180) {
        const artworkSize = (size * window.devicePixelRatio);
        const artworkURL = album.formatArtworkURL(artworkSize, artworkSize);
        return super._getContent(album.name, album.artist, artworkURL, album.isExplicit, () => {
            EventCenter.emit(GeneralEvents.BUTTON_PRESS, Buttons.ALBUM_OPEN_VIEW, album);
        });
    }
}
