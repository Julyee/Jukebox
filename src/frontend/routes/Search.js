import {Service} from '../../service/Service';
import {Layout} from '../Layout';
import {IOSSpinner} from 'polythene-mithril';
import {ItemRows} from '../utils/ItemRows';
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

        let hasContent = false;
        Object.keys(this.mSearchResults).forEach(key => {
            hasContent = this.mSearchResults[key] || hasContent;
        });

        if (!hasContent) {
            return m('.search-result-header', `No results found for "${this.mSearchTerm}".`);
        }

        return [
            m('.search-result-header', `Results for "${this.mSearchTerm}"`),
            ItemRows.getSongsRow(this.mSearchResults),
            ItemRows.getAlbumRow(this.mSearchResults),
            ItemRows.getPlaylistsRow(this.mSearchResults),
            ItemRows.getVideosRow(this.mSearchResults),
            ItemRows.getArtistsRow(this.mSearchResults),
        ];
    }

    _updateSearch() {
        const searchTerm = m.route.param('q') || null;
        if (searchTerm !== this.mSearchTerm) {
            this.mSearchTerm = searchTerm;
            if (this.mSearchTerm) {
                const service = Service.activeService();
                this.mSearchResults = null;
                service.search(searchTerm, 21).then(result => {
                    this.mSearchResults = result;
                    m.redraw();
                });
            }
        }
    }
}
