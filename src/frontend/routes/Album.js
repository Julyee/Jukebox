import {Layout} from '../Layout';
import {Service} from '../../service/Service';
import m from 'mithril';
import {IOSSpinner} from 'polythene-mithril';
import {SongListView} from '../components/SongListView';
import {Buttons} from '../Events';

export class Album extends Layout {
    constructor() {
        super();
        this.mAlbumID = null;
        this.mSongID = null;
        this.mServiceName = null;
        this.mAlbum = null;
    }

    oncreate() {
        super.oncreate();
        this._updateAlbum();
    }

    onupdate() {
        this._updateAlbum();
    }

    content() {
        if (!this.mAlbum && !this.mAlbumID && !this.mSongID) {
            return m('.song-list-view-screen-center', m('.song-list-view-error', 'ERROR: Could not load album, please try again.'));
        } else if (!this.mAlbum && (this.mAlbumID || this.mSongID)) {
            return m('.song-list-view-screen-center',
                m('.song-list-view-loading', [
                    m(IOSSpinner, {
                        permanent: true,
                        show: true,
                        raised: false,
                        singleColor: true,
                        className: 'song-list-view-loading-icon',
                    }),
                    m('.song-list-view-loading-text', 'Loading...'),
                ]),
            );
        }

        const album = this.mAlbum;
        const artworkURL = album.formatArtworkURL(350, 350);

        return m(SongListView, {
            mediaItem: album,
            artworkURL: artworkURL,
            moreDialogOptions: {
                showAlbumButton: false,
            },
            buttons: [
                {
                    label: 'Play',
                    event: Buttons.MEDIA_ITEM_PLAY_NOW,
                    eventData: album,
                },
                {
                    label: 'Shuffle',
                    event: Buttons.MEDIA_ITEM_SHUFFLE,
                    eventData: album,
                },
            ],
            songDisplayThumbnail: false,
            songMoreDialogOptions: {
                showAlbumButton: false,
            },
        });
    }

    _updateAlbum() {
        const albumID = m.route.param('a') || null;
        const songID = m.route.param('s') || null;
        const serviceName = m.route.param('x') || null;
        if (albumID !== this.mAlbumID || songID !== this.mSongID || serviceName !== this.mServiceName) {
            this.mAlbumID = albumID || null;
            this.mSongID = songID || null;
            this.mServiceName = serviceName || null;
            const service = Service.activeService(serviceName ? serviceName : null);
            if (service && (albumID || songID)) {
                this.mAlbum = null;
                let p;
                if (albumID) {
                    p = service.getAlbumInfo(albumID);
                } else {
                    p = service.getAlbumForSong(songID);
                }
                p.then(result => {
                    if (result) {
                        this.mAlbum = result;
                    } else {
                        this.mAlbum = null;
                    }
                    m.redraw();
                });
            } else {
                this.mAlbumID = null;
                this.mSongID = null;
                this.mServiceName = null;
                this.mAlbum = null;
                m.redraw();
            }
        }
    }
}
