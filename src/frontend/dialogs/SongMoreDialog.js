import m from 'mithril';
import {SongHeader} from '../components/SongHeader';
import {Dialog, List, ListTile} from 'polythene-mithril';
import {GeneralEvents, Buttons} from '../Events';
import {EventCenter} from '../../core/EventCenter';

const kMenuItems = [
    { title: 'Play Now (keep up next)', event: Buttons.SONG_PLAY_KEEP_QUEUE },
    { title: 'Play Next', event: Buttons.SONG_PLAY_NEXT },
    { title: 'Add to a Playlist...', event: Buttons.SONG_ADD_TO_PLAYLIST },
    { title: 'Create Station', event: Buttons.SONG_CREATE_STATION },
    { title: 'Play Last', event: Buttons.SONG_PLAY_LATER },
];

function _getMenuItems(items, song) {
    return items.map(item => m(ListTile, {
        subtitle: item.title,
        ink: true,
        hoverable: true,
        compact: true,
        events: {
            onclick: () => {
                EventCenter.emit(GeneralEvents.BUTTON_PRESS, item.event, song);
                Dialog.hide();
            },
        },
    }));
}

export const SongMoreDialog = {
    get: function getDialog(song, items = kMenuItems) {
        return {
            hideDelay: 0.12,
            shadowDepth: 1,
            backdrop: true,
            header: m(SongHeader, {song}),
            menu: m(List, {
                border: true,
                indentedBorder: false,
                compact: false,
                padding: 'none',
                tiles: _getMenuItems(items, song),
            }),
        };
    },
};
