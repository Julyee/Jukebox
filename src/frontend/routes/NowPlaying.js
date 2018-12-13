import m from 'mithril';
import {Layout} from '../Layout';
import {List} from 'polythene-mithril';
import {SongItem} from '../components/SongItem';
import {MediaManager} from '../../service/MediaManager';
import {Buttons} from '../Events';

export class NowPlaying extends Layout {
    content() {
        const currentSong = MediaManager.currentSong;
        const date = currentSong && currentSong.releaseDate ? new Date(currentSong.releaseDate) : null;
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        const artwork = currentSong ? m('.now-playing-artwork', {
            style: {
                'background-image': `url(${currentSong.formatArtworkURL(350, 350)})`,
            },
        }) : m('.now-playing-artwork', {

        });

        const info = currentSong ? m('.now-playing-song-info-container', [
            currentSong.isExplicit ? m('.song-list-view-explicit', '🅴') : null,
            currentSong.title ? m('.song-list-view-title', currentSong.title) : null,
            currentSong.subtitle ? m('.song-list-view-subtitle', currentSong.subtitle) : null,
            date ? m('.song-list-view-date', date.toLocaleDateString('en-US', dateOptions)) : null,
            currentSong.genres ? m('.song-list-view-genre', currentSong.genres.join(', ')) : null,
            currentSong.formattedDuration ? m('.song-list-view-duration', currentSong.formattedDuration) : null,
        ]) : m('.now-playing-song-info-container', m('.now-playing-list-title', 'Not Playing super long title that we can use to test everything yo'));

        const songs = [];
        songs.push(...MediaManager.queue);

        return m('.now-playing-container', [
            m('.now-playing-song-container', [
                artwork,
                info,
            ]),
            m('.now-playing-list-container', [
                m('.now-playing-list-title', 'Up Next'),
                songs.length ? m(List, {
                    border: true,
                    indentedBorder: false,
                    compact: false,
                    padding: 'none',
                    tiles: songs.map(song => m(SongItem, {
                        song: song,
                        size: 52,
                        clickable: false,
                        displayThumbnail: true,
                        songMenuItems: [
                            { title: 'Add to a Playlist...', event: Buttons.SONG_ADD_TO_PLAYLIST },
                            { title: 'Create Station', event: Buttons.SONG_CREATE_STATION },
                        ],
                    })),
                }) : null,
            ]),
        ]);
    }
}
