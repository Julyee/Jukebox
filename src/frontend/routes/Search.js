import { Service } from '../../service/Service';
import { Layout } from '../Layout';
import {IOSSpinner, Card} from 'polythene-mithril';
import { CardCSS } from "polythene-css"
import m from 'mithril';

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
            this._getAlbumRow(this.mSearchResults),
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
                service.search(searchTerm, 20).then(result => {
                    console.log(result); // eslint-disable-line
                    this.mSearchResults = result;
                    m.redraw();
                });
            }
        }
    }

    /**
     {songs: {…}, albums: {…}, playlists: {…}, music-videos: {…}, artists: {…}}
     albums
     :
     {href: "/v1/catalog/ca/search?term=hello&types=albums", next: "/v1/catalog/ca/search?offset=5&term=hello&types=albums", data: Array(5)}
     artists
     :
     {href: "/v1/catalog/ca/search?term=hello&types=artists", next: "/v1/catalog/ca/search?offset=5&term=hello&types=artists", data: Array(5)}
     music-videos
     :
     {href: "/v1/catalog/ca/search?term=hello&types=music-videos", next: "/v1/catalog/ca/search?offset=5&term=hello&types=music-videos", data: Array(5)}
     playlists
     :
     {href: "/v1/catalog/ca/search?term=hello&types=playlists", next: "/v1/catalog/ca/search?offset=5&term=hello&types=playlists", data: Array(5)}
     songs
     :
     {href: "/v1/catalog/ca/search?term=hello&types=songs", next: "/v1/catalog/ca/search?offset=5&term=hello&types=songs", data: Array(5)}
     __proto__
     :
     */

    _getAlbumRow(results) {
        if (!results.hasOwnProperty('albums')) {
            return null;
        }

        return m('.search-result-container', [
            m('.search-result-title', 'Albums'),
            m('.search-result-row', results.albums.data.map(album => {
                const info = album.attributes;
                const albumSize = (180 * window.devicePixelRatio).toString();
                const artworkURL = info.artwork.url.replace('{w}', albumSize).replace('{h}', albumSize);
                return m('.search-result-album-container', m(Card, {
                    shadowDepth: 0,
                    content: [
                        {
                            media: {
                                ratio: 'square',
                                size: 'small',
                                content: m("img", {
                                    src: artworkURL,
                                }),
                            },
                        },
                        {
                            any: {
                                content: [
                                    m('.search-result-album-name', info.name),
                                    m('.search-result-album-artist', info.artistName),
                                ],
                            },
                        },
                    ],
                }));
            })),
        ]);
    }
}
