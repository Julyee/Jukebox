import {Layout} from '../Layout';
import {Service} from '../../service/Service';
import m from 'mithril';
import {IOSSpinner} from 'polythene-mithril';
import {SongListView} from '../components/SongListView';
import {Buttons} from '../Events';

export class Playlist extends Layout {
    constructor() {
        super();
        this.mPlaylist = null;
        this.mPlaylistID = null;
        this.mServiceName = null;
    }

    oncreate() {
        super.oncreate();
        this._updatePlaylist();
    }

    onupdate() {
        this._updatePlaylist();
    }

    content() {
        if (!this.mPlaylist && !this.mPlaylistID) {
            return m('.song-list-view-screen-center', m('.song-list-view-error', 'ERROR: Could not load playlist, please try again.'));
        } else if (!this.mPlaylist && this.mPlaylistID) {
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

        const playlist = this.mPlaylist;
        const artworkURL = playlist.formatArtworkURL(350, 350);

        return m(SongListView, {
            mediaItem: playlist,
            artworkURL: artworkURL,
            moreDialogOptions: {
                showAlbumButton: false,
                showArtistButton: false,
            },
            buttons: [
                {
                    label: 'Play',
                    event: Buttons.MEDIA_ITEM_PLAY_NOW,
                    eventData: playlist,
                },
                {
                    label: 'Shuffle',
                    event: Buttons.MEDIA_ITEM_SHUFFLE,
                    eventData: playlist,
                },
            ],
            songDisplayThumbnail: true,
            songMoreDialogOptions: {
                showAlbumButton: true,
                showArtistButton: true,
            },
        });
    }

    _updatePlaylist() {
        const playlistID = m.route.param('p') || null;
        const serviceName = m.route.param('x') || null;
        if (playlistID !== this.mPlaylistID || serviceName !== this.mServiceName) {
            this.mPlaylistID = playlistID || null;
            this.mServiceName = serviceName || null;
            const service = Service.activeService(serviceName ? serviceName : null);
            if (service && playlistID) {
                this.mPlaylist = null;
                service.getPlaylistInfo(playlistID).then(result => {
                    if (result) {
                        this.mPlaylist = result;
                    } else {
                        this.mPlaylist = null;
                    }
                    m.redraw();
                });
            } else {
                this.mPlaylist = null;
                this.mPlaylistID = null;
                this.mServiceName = null;
                m.redraw();
            }
        }
    }
}
