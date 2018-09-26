import {Service} from '../../service/Service';
import {Layout} from '../Layout';
import {IOSSpinner, Card, List, ListTile, Icon} from 'polythene-mithril';
import {IconCSS} from 'polythene-css';
import {EventCenter} from '../../core/EventCenter';
import {Events, Buttons} from '../Events';
import m from 'mithril';

import {svgPathData as profilePathData} from '@fortawesome/free-solid-svg-icons/faUserCircle';
const iconProfile = m.trust(`<svg width="280" height="280" viewBox="-25 -25 550 550"><path d="${profilePathData}"/></svg>`);

IconCSS.addStyle('.artist-icon', {
    'size_large': 40,
});

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

        if (!Object.keys(this.mSearchResults).length) {
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
                    console.log(result); // eslint-disable-line
                    this.mSearchResults = result;
                    m.redraw();
                });
            }
        }
    }

    _makeLargeThumbnailCard(title, subtitle, artworkURL, isExplicit) {
        return m('.search-result-album-container', m(Card, {
            shadowDepth: 0,
            content: [
                {
                    media: {
                        ratio: 'square',
                        size: 'small',
                        content: m('img', {
                            src: artworkURL,
                        }),
                    },
                },
                {
                    any: {
                        content: [
                            m('.search-result-album-name', title),
                            isExplicit ? m('.search-result-album-explicit', '🅴') : null,
                            m('.search-result-album-artist', subtitle),
                        ],
                    },
                },
            ],
        }));
    }

    _getAlbumRow(results) {
        if (!results.albums) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Albums'),
            m('.search-result-row', results.albums.map(album => {
                const info = album.attributes;
                const artworkSize = (180 * window.devicePixelRatio).toString();
                const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkSize).replace('{h}', artworkSize);
                return this._makeLargeThumbnailCard(info.name, info.artistName, artworkURL, info.contentRating === 'explicit');
            })),
        ]);
    }

    _getPlaylistsRow(results) {
        if (!results.playlists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Playlists'),
            m('.search-result-row', results.playlists.map(playlist => {
                const info = playlist.attributes;
                const artworkSize = (180 * window.devicePixelRatio).toString();
                const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkSize).replace('{h}', artworkSize);
                return this._makeLargeThumbnailCard(info.name, info.curatorName, artworkURL, info.contentRating === 'explicit');
            })),
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
            const artworkURL = song.formatArtworkURL(52, 52);

            if (col.length >= 3) {
                cols.push(this._makeSongColumn(col));
                col = [];
            }

            col.push(m(ListTile, {
                subContent: [
                    m('.search-result-song-name', song.name),
                    song.rating === 'explicit' ? m('.search-result-song-explicit', '🅴') : null,
                    m('.search-result-song-artist', song.artist),
                    m('.search-result-song-album', song.album),
                ],
                hoverable: true,
                navigation: false,
                compact: true,
                ink: true,
                events: {
                    onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.PLAY_SONG_BUTTON, song),
                },
                front: m('.search-result-song-icon', {
                    style: {
                        'background-image': `url(${artworkURL})`,
                    },
                }),
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
            m('.search-result-row', results['music-videos'].map(video => {
                const info = video.attributes;

                const artworkWidth = (360 * window.devicePixelRatio).toString();
                const artworkHeight = Math.floor((info.artwork.height / info.artwork.width) * 360 * window.devicePixelRatio);
                const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkWidth).replace('{h}', artworkHeight);
                // return this._makeLargeThumbnailCard(info.name, info.artistName, artworkURL, info.contentRating === 'explicit');
                return m('.search-result-video-container', m(Card, {
                    shadowDepth: 0,
                    events: {
                        onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.PLAY_SONG_BUTTON, video),
                    },
                    content: [
                        {
                            media: {
                                // ratio: 'square',
                                size: 'small',
                                content: m('img', {
                                    src: artworkURL,
                                }),
                            },
                        },
                        {
                            overlay: {
                                shadowDepth: 0,
                                content: [
                                    {
                                        any: {
                                            content: [
                                                m('.search-result-video-info-container', [
                                                    m('.search-result-video-info-background', {
                                                        style: {
                                                            'background-image': `url(${artworkURL})`,
                                                        },
                                                    }),
                                                    m('.search-result-video-name', info.name),
                                                    info.contentRating === 'explicit' ? m('.search-result-video-explicit', '🅴') : null,
                                                    m('.search-result-video-artist', info.artistName),
                                                ]),
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }));
            })),
        ]);
    }

    _getArtistsRow(results) {
        if (!results.artists) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Artists'),
            m('.search-result-row', results.artists.map(artist => {
                const info = artist.attributes;
                const genres = info.genreNames.length ? info.genreNames.join(', ') : 'N/A';
                let albums;
                if (artist.relationships.albums && artist.relationships.albums.data.length) {
                    albums = artist.relationships.albums.data.length;
                    if (artist.relationships.albums.next) {
                        albums += '+';
                    }
                    albums += ` ${artist.relationships.albums.data.length === 1 ? 'Album' : 'Albums'}`;
                } else {
                    albums = 'No Albums';
                }
                return m('.search-result-artist-container', m(Card, {
                    shadowDepth: 0,
                    content: [
                        {
                            any: {
                                content: [
                                    m('.search-result-artist-icon', m(Icon, {
                                        svg: iconProfile,
                                        size: 'large',
                                        className: 'artist-icon',
                                    })),
                                    m('.search-result-artist-info', [
                                        m('.search-result-artist-name', info.name),
                                        m('.search-result-artist-genre', genres),
                                        m('.search-result-artist-genre', albums),
                                    ]),
                                ],
                            },
                        },
                    ],
                }));
            })),
        ]);
    }
}
