import m from 'mithril';
import {ListTile} from 'polythene-mithril';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';

export class SongItem {
    view(vnode) {
        return this._getContent(vnode.attrs.song, vnode.attrs.size);
    }

    _getContent(song, size = 52) {
        const artworkURL = song.formatArtworkURL(size, size);
        return m(ListTile, {
            subContent: [
                m('.song-item-song-name', song.name),
                song.rating === 'explicit' ? m('.song-item-song-explicit', '🅴') : null,
                m('.song-item-song-artist', song.artist),
                m('.song-item-song-album', song.album),
            ],
            hoverable: true,
            navigation: false,
            compact: true,
            ink: true,
            events: {
                onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.PLAY_SONG_BUTTON, song),
            },
            front: m('.song-item-song-icon', {
                style: {
                    'background-image': `url(${artworkURL})`,
                },
            }),
            // after: m('div', 'hello!'),
        });
    }
}
