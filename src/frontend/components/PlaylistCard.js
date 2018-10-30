import {LargeThumbnailCard} from './LargeThumbnailCard';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents} from '../Events';

export class PlaylistCard extends LargeThumbnailCard {
    view(vnode) {
        return this._getContent(vnode.attrs.playlist, vnode.attrs.size);
    }

    _getContent(playlist, size = 180) {
        const artworkURL = playlist.formatArtworkURL(size, size);
        return super._getContent(playlist.name, playlist.curator, artworkURL, playlist.isExplicit, () => {
            EventCenter.emit(GeneralEvents.BUTTON_PRESS, Buttons.PLAYLIST_OPEN_VIEW, playlist);
        });
    }
}
