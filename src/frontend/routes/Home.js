import {IOSSpinner} from 'polythene-mithril';
import {ItemRows} from '../utils/ItemRows';
import {Service} from '../../service/Service';
import {Layout} from '../Layout';
import m from 'mithril';

export class Home extends Layout {
    constructor() {
        super();
        this.mContent = null;
    }

    oncreate() {
        super.oncreate();
        this._loadContent();
    }

    content() {
        if (!this.mContent) {
            return m('.search-full-centered', [
                m('.search-loading-icon', [
                    m(IOSSpinner, {
                        permanent: true,
                        show: true,
                        raised: false,
                        singleColor: true,
                    }),
                ]),
                m('.search-loading-text', 'Loading...'),
            ]);
        } else if (this.mContent.hasOwnProperty('error')) {
            return m('.search-full-centered', [
                m('.search-loading-text', this.mContent.error),
            ]);
        }

        return this.mContent.map(row => {
            switch (row.type) {
                case 'albums':
                    return ItemRows.getAlbumRow(row, row.name);

                case 'artists':
                    return ItemRows.getArtistsRow(row, row.name);

                case 'playlists':
                    return ItemRows.getPlaylistsRow(row, row.name);

                case 'songs':
                    return ItemRows.getSongsRow(row, row.name);

                case 'videos':
                    return ItemRows.getVideosRow(row, row.name);

                default:
                    break;
            }
            return null;
        });
    }

    _loadContent() {
        if (!this.mContent && Service.activeService()) {
            Service.activeService().getHomeContent().then(content => {
                if (content) {
                    this.mContent = content;
                } else {
                    this.mContent = {
                        error: 'An error occurred loading the home content, please try again later.',
                    };
                }
                m.redraw();
            });
        }
    }
}
