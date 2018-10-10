import {Service} from '../../service/Service';
import {Layout} from '../Layout';
import {IOSSpinner, List} from 'polythene-mithril';
import {SongItem} from '../components/SongItem';
import {VideoCard} from '../components/VideoCard';
import m from 'mithril';

import {AlbumCard} from '../components/AlbumCard';
import {PlaylistCard} from '../components/PlaylistCard';
import {ArtistCard} from '../components/ArtistCard';

export class Search extends Layout {
    constructor() {
        super();
        this.mSearchTerm = null;
        this.mSearchResults = null;
    }

    oncreate() {
        super.oncreate();
        this._updateSearch();
    }

    onupdate() {
        this._updateSearch();
    }

    content() {
        if (!this.mSearchTerm) {
            return m('div', 'ERROR: Invalid search term.');
        }

        if (!this.mSearchResults) {
            return m('.search-full-centered', [
                m('.search-loading-icon', [
                    m(IOSSpinner, {
                        permanent: true,
                        show: true,
                        raised: false,
                        singleColor: true,
                    }),
                ]),
                m('.search-loading-text', `Searching for "${this.mSearchTerm}"...`),
            ]);
        }

        let hasContent = false;
        Object.keys(this.mSearchResults).forEach(key => {
            hasContent = this.mSearchResults[key] || hasContent;
        });

        if (!hasContent) {
            return m('.search-result-header', `No results found for "${this.mSearchTerm}".`);
        }

        return [
            m('.search-result-header', `Results for "${this.mSearchTerm}"`),
            this._getSongsRow(this.mSearchResults),
            this._getAlbumRow(this.mSearchResults),
            this._getPlaylistsRow(this.mSearchResults),
            this._getVideosRow(this.mSearchResults),
            this._getArtistsRow(this.mSearchResults),
        ];
    }

    _updateSearch() {
        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        const searchTerm = parsedUrl.searchParams.get('q');
        if (searchTerm !== this.mSearchTerm) {
            this.mSearchTerm = searchTerm;
            if (this.mSearchTerm) {
                const service = Service.activeService();
                this.mSearchResults = null;
                service.search(searchTerm, 21).then(result => {
                    console.log(result);
                    this.mSearchResults = result;
                    m.redraw();
                });
            }
        }
    }

    _getAlbumRow(results) {
        if (!results.albums) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Albums'),
            m('.search-result-row', results.albums.map(album => m(AlbumCard, { album: album, size: 180 }))),
        ]);
    }

    _getPlaylistsRow(results) {
        if (!results.playlists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Playlists'),
            m('.search-result-row', results.playlists.map(playlist => m(PlaylistCard, { playlist: playlist, size: 180 }))),
        ]);
    }

    _makeSongColumn(tiles) {
        return m('.search-result-song-column', m(List, {
            border: true,
            indentedBorder: false,
            compact: false,
            padding: 'none',
            tiles: tiles,
        }));
    }

    _getSongsRow(results) {
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
            m('.search-result-title', 'Songs'),
            m('.search-result-row', cols),
        ]);
    }

    _getVideosRow(results) {
        if (!results['music-videos']) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Music Videos'),
            m('.search-result-row', results['music-videos'].map(video => m(VideoCard, { video: video, width: 360 }))),
        ]);
    }

    _getArtistsRow(results) {
        if (!results.artists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Artists'),
            m('.search-result-row', results.artists.map(artist => m(ArtistCard, { artist }))),
        ]);
    }
}
