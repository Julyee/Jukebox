import m from 'mithril';
import {AlbumCard} from '../components/AlbumCard';
import {PlaylistCard} from '../components/PlaylistCard';
import {SongItem} from '../components/SongItem';
import {VideoCard} from '../components/VideoCard';
import {ArtistCard} from '../components/ArtistCard';
import {List} from 'polythene-mithril';

export class ItemRows {
    static getAlbumRow(results, name = 'Albums') {
        if (!results.albums) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', name),
            m('.search-result-row', results.albums.map(album => m(AlbumCard, { album: album, size: 180 }))),
        ]);
    }

    static getPlaylistsRow(results, name = 'Playlists') {
        if (!results.playlists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', name),
            m('.search-result-row', results.playlists.map(playlist => m(PlaylistCard, { playlist: playlist, size: 180 }))),
        ]);
    }

    static _makeSongColumn(tiles) {
        return m('.search-result-song-column', m(List, {
            border: true,
            indentedBorder: false,
            compact: false,
            padding: 'none',
            tiles: tiles,
        }));
    }

    static getSongsRow(results, name = 'Songs') {
        if (!results.songs) {
            return null;
        }

        const cols = [];
        let col = [];

        results.songs.forEach(song => {
            if (col.length >= 3) {
                cols.push(this._makeSongColumn(col));
                col = [];
            }

            col.push(m(SongItem, {
                song: song,
                size: 52,
            }));
        });

        if (col.length) {
            cols.push(this._makeSongColumn(col));
        }

        return m('.search-result-container', [
            m('.search-result-title', name),
            m('.search-result-row', cols),
        ]);
    }

    static getVideosRow(results, name = 'Music Videos') {
        if (!results.videos) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', name),
            m('.search-result-row', results.videos.map(video => m(VideoCard, { video: video, width: 360 }))),
        ]);
    }

    static getArtistsRow(results, name = 'Artists') {
        if (!results.artists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', name),
            m('.search-result-row', results.artists.map(artist => m(ArtistCard, { artist }))),
        ]);
    }
}
