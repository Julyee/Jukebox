import {Button, Dialog} from 'polythene-mithril';
import {ButtonCSS} from 'polythene-css';
import m from 'mithril';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';

ButtonCSS.addStyle('.song-header-button', {
    'label_padding_v': 3,
    'border_radius': 10,
    'outer_padding_v': 0,
    // text_transform: 'none',
    'color_light_background': 'rgb(21,150,199)',
});

export class SongHeader {
    view(vnode) {
        const song = vnode.attrs.song;
        const showAlbumButton = vnode.attrs.moreDialogOptions.hasOwnProperty('showAlbumButton') ? vnode.attrs.showAlbumButton : true;
        const showArtistButton = vnode.attrs.moreDialogOptions.hasOwnProperty('showArtistButton') ? vnode.attrs.showArtistButton : true;
        const artworkURL = song.formatArtworkURL(100, 100);
        return m('.song-header-container', [
            m('.song-header-icon-container', m('.song-header-icon', {
                style: {
                    'background-image': `url(${artworkURL})`,
                },
            })),
            m('.song-header-info-container', [
                m('.song-header-info', [
                    m('.song-header-song-name', song.name),
                    song.isExplicit ? m('.song-header-explicit', '🅴') : null,
                    m('.song-header-artist', song.artist),
                    m('.song-header-album', song.album),
                    m('.song-header-time', song.formattedDuration),
                    m('.song-header-buttons', [
                        showAlbumButton ? m(Button, {
                            label: 'Album',
                            className: 'song-header-button',
                            textStyle: {
                                'font-size': '9px',
                                'color': '#f9f9ff',
                            },
                            events: {
                                onclick: () => {
                                    Dialog.hide().then(() => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_GO_TO_ALBUM, song));
                                },
                            },
                        }) : null,
                        showArtistButton ? m(Button, {
                            label: 'Artist',
                            className: 'song-header-button',
                            textStyle: {
                                'font-size': '9px',
                                'color': '#f9f9ff',
                            },
                            events: {
                                onclick: () => {
                                    Dialog.hide().then(() => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_GO_TO_ARTIST, song));
                                },
                            },
                        }) : null,
                    ]),
                ]),
            ]),
        ]);
    }
}
