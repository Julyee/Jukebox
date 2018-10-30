import {Button, Dialog} from 'polythene-mithril';
import {ButtonCSS} from 'polythene-css';
import m from 'mithril';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';

ButtonCSS.addStyle('.more-dialog-header-button', {
    'label_padding_v': 3,
    'border_radius': 10,
    'outer_padding_v': 0,
    // text_transform: 'none',
    'color_light_background': 'rgb(21,150,199)',
});

export class MoreDialogHeader {
    view(vnode) {
        const mediaItem = vnode.attrs.mediaItem;
        const showAlbumButton = vnode.attrs.moreDialogOptions.hasOwnProperty('showAlbumButton') ? vnode.attrs.moreDialogOptions.showAlbumButton : true;
        const showArtistButton = vnode.attrs.moreDialogOptions.hasOwnProperty('showArtistButton') ? vnode.attrs.moreDialogOptions.showArtistButton : true;
        const artworkURL = mediaItem.formatArtworkURL(100, 100);
        return m('.more-dialog-header-container', [
            m('.more-dialog-header-icon-container', m('.more-dialog-header-icon', {
                style: {
                    'background-image': artworkURL ? `url(${artworkURL})` : 'none',
                },
            })),
            m('.more-dialog-header-info-container', [
                m('.more-dialog-header-info', [
                    m('.more-dialog-header-title', mediaItem.title),
                    mediaItem.isExplicit ? m('.more-dialog-header-explicit', '🅴') : null,
                    m('.more-dialog-header-subtitle', mediaItem.subtitle),
                    m('.more-dialog-header-detail', mediaItem.detail),
                    m('.more-dialog-header-time', mediaItem.formattedDuration),
                    m('.more-dialog-header-buttons', [
                        showAlbumButton ? m(Button, {
                            label: 'Album',
                            className: 'more-dialog-header-button',
                            textStyle: {
                                'font-size': '9px',
                                'color': '#f9f9ff',
                            },
                            events: {
                                onclick: () => {
                                    Dialog.hide().then(() => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_GO_TO_ALBUM, mediaItem));
                                },
                            },
                        }) : null,
                        showArtistButton ? m(Button, {
                            label: 'Artist',
                            className: 'more-dialog-header-button',
                            textStyle: {
                                'font-size': '9px',
                                'color': '#f9f9ff',
                            },
                            events: {
                                onclick: () => {
                                    Dialog.hide().then(() => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_GO_TO_ARTIST, mediaItem));
                                },
                            },
                        }) : null,
                    ]),
                ]),
            ]),
        ]);
    }
}
