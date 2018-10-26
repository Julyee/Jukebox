import m from 'mithril';
import {Button, IconButton, Dialog, List, Icon} from 'polythene-mithril';
import {SongItem} from './SongItem';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';
import {ButtonCSS} from 'polythene-css';
import * as moreSVG from '../../../node_modules/@fortawesome/free-solid-svg-icons/faEllipsisH';

ButtonCSS.addStyle('.song-list-view-button', {
    'label_padding_v': 3,
    'border_radius': 10,
    'outer_padding_v': 0,
    // text_transform: 'none',
    'color_light_background': 'rgb(21,150,199)',
});

const iconMore = m.trust(`<svg width="15" height="15" viewBox="0 0 ${moreSVG.width} ${moreSVG.height}"><path d="${moreSVG.svgPathData}"/></svg>`);

export class SongListView {
    view(vnode) {
        const options = vnode.attrs;
        const mediaItem = options.mediaItem;
        const buttons = options.hasOwnProperty('buttons') ? options.buttons : [];
        const date = mediaItem.releaseDate ? new Date(mediaItem.releaseDate) : null;
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const headerButtons = buttons.map(button => m(Button, {
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
        }));

        if (options.moreDialogOptions) {
            headerButtons.push(m(IconButton, {
                inactive: false,
                events: {
                    onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_MORE, mediaItem, options.moreDialogOptions),
                },
            },
            m(Icon, {
                svg: iconMore,
                size: 'small',
                className: 'song-list-view-more-container',
            })));
        }

        return m('.song-list-view-container', [
            m('.song-list-view-header', [
                options.artworkURL ? m('.song-list-view-artwork', {
                    style: {
                        'background-image': `url(${options.artworkURL})`,
                    },
                }) : null,
                m('.song-list-view-info-container', [
                    mediaItem.isExplicit ? m('.song-list-view-explicit', '🅴') : null,
                    mediaItem.title ? m('.song-list-view-title', mediaItem.title) : null,
                    mediaItem.subtitle ? m('.song-list-view-subtitle', mediaItem.subtitle) : null,
                    date ? m('.song-list-view-date', date.toLocaleDateString('en-US', dateOptions)) : null,
                        mediaItem.genres ? m('.song-list-view-genre', mediaItem.genres.join(', ')) : null,
                    mediaItem.formattedDuration ? m('.song-list-view-duration', mediaItem.formattedDuration) : null,
                    m('.song-list-view-buttons', headerButtons),
                ]),
            ]),
            mediaItem.longDescription ? m('.song-list-view-description', m.trust(mediaItem.longDescription)) : null,
            mediaItem.songs ? m('.song-list-view-songs-container', m(List, {
                border: true,
                indentedBorder: false,
                compact: false,
                padding: 'none',
                tiles: mediaItem.songs.map(song => m(SongItem, {
                    song: song,
                    size: 52,
                    displayThumbnail: options.songDisplayThumbnail,
                    moreDialogOptions: options.songMoreDialogOptions,
                })),
            })) : null,
        ]);
    }
}
