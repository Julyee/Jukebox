import m from 'mithril';
import {Button, Dialog, List} from 'polythene-mithril';
import {SongItem} from './SongItem';
import {EventCenter} from '../../core/EventCenter';
import {Events} from '../Events';
import {ButtonCSS} from 'polythene-css';

ButtonCSS.addStyle('.song-list-view-button', {
    'label_padding_v': 3,
    'border_radius': 10,
    'outer_padding_v': 0,
    // text_transform: 'none',
    'color_light_background': 'rgb(21,150,199)',
});

export class SongListView {
    view(vnode) {
        const options = vnode.attrs;
        const buttons = options.hasOwnProperty('buttons') ? options.buttons : [];
        const date = new Date(options.date);
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return m('.song-list-view-container', [
            m('.song-list-view-header', [
                m('.song-list-view-artwork', {
                    style: {
                        'background-image': `url(${options.artworkURL})`,
                    },
                }),
                m('.song-list-view-info-container', [
                    options.isExplicit ? m('.song-list-view-explicit', '🅴') : null,
                    m('.song-list-view-title', options.title),
                    m('.song-list-view-subtitle', options.subtitle),
                    m('.song-list-view-date', date.toLocaleDateString('en-US', dateOptions)),
                    m('.song-list-view-genre', options.genres),
                    m('.song-list-view-buttons', buttons.map(button => m(Button, {
                        label: button.label,
                        className: 'song-list-view-button',
                        textStyle: {
                            'font-size': '9px',
                            'color': '#f9f9ff',
                        },
                        events: {
                            onclick: () => {
                                Dialog.hide().then(() => EventCenter.emit(Events.BUTTON_PRESS, button.event, button.eventData));
                            },
                        },
                    }))),
                ]),
            ]),
            options.description ? m('.song-list-view-description', m.trust(options.description)) : null,
            m('.song-list-view-songs-container', m(List, {
                border: true,
                indentedBorder: false,
                compact: false,
                padding: 'none',
                tiles: options.songs.map(song => m(SongItem, {
                    song: song,
                    size: 52,
                    displayThumbnail: options.displayThumbnail,
                    moreDialogOptions: options.moreDialogOptions,
                })),
            })),
        ]);
    }
}
