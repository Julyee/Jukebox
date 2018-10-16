import m from 'mithril';
import {ListTile} from 'polythene-mithril';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';
import * as moreSVG from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import * as playSVG from '@fortawesome/free-solid-svg-icons/faPlayCircle';

const iconMore = m.trust(`<svg width="15" height="15" viewBox="0 0 ${moreSVG.width} ${moreSVG.height}"><path d="${moreSVG.svgPathData}"/></svg>`);
const iconPlay = m.trust(`<svg width="38" height="38" viewBox="0 0 ${playSVG.width} ${playSVG.height}"><path d="${playSVG.svgPathData}"/></svg>`);

export class SongItem {
    view(vnode) {
        const song = vnode.attrs.song;
        const size = vnode.attrs.size || 52;
        const moreDialogOptions = vnode.attrs.moreDialogOptions || {};
        const displayThumbnail = vnode.attrs.hasOwnProperty('displayThumbnail') ? vnode.attrs.displayThumbnail : true;
        const artworkURL = song.formatArtworkURL(size, size);
        return m(ListTile, {
            subContent: m('.song-item-details', [
                m('.song-item-song-name', song.name),
                song.isExplicit ? m('.song-item-song-explicit', '🅴') : null,
                m('.song-item-song-artist', song.artist),
                m('.song-item-song-album', song.album),
            ]),
            hoverable: true,
            navigation: false,
            compact: true,
            ink: true,
            events: {
                onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_PLAY_NOW, song),
            },
            front: displayThumbnail ? m('.song-item-song-icon', {
                style: {
                    'background-image': `url(${artworkURL})`,
                },
            }) : m('.song-item-play-icon', iconPlay),
            after: m('.song-item-more-container', {
                onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_MORE, song, moreDialogOptions),
            }, iconMore),
        });
    }
}
