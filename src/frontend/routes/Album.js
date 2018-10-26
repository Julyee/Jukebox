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
            return m('.album-view-screen-center', m('.album-view-error', 'ERROR: Could not load album, please try again.'));
        } else if (!this.mAlbum && (this.mAlbumID || this.mSongID)) {
            return m('.album-view-screen-center',
                m('.album-view-loading', [
                    m(IOSSpinner, {
                        permanent: true,
                        show: true,
                        raised: false,
                        singleColor: true,
                        className: 'album-view-loading-icon',
                    }),
                    m('.album-view-loading-text', 'Loading...'),
                ]),
            );
        }

        const album = this.mAlbum;
        const artworkURL = album.formatArtworkURL(400, 400);

        return m(SongListView, {
            artworkURL: artworkURL,
            title: album.name,
            subtitle: album.artist,
            isExplicit: album.isExplicit,
            date: album.releaseDate,
            genres: album.genres.join(', '),
            description: album.longDescription,
            songs: album.songs,
            displayThumbnail: false,
            moreDialogOptions: {
                showAlbumButton: false,
            },
            buttons: [
                {
                    label: 'Artist',
                    event: Buttons.ARTIST_OPEN_VIEW,
                    eventData: null, // TODO
                },
            ],
        });
    }

    _updateAlbum() {
        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        const albumID = parsedUrl.searchParams.get('a');
        const songID = parsedUrl.searchParams.get('s');
        const serviceName = parsedUrl.searchParams.get('x');
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
