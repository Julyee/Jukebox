import {Layout} from '../Layout';
import {Service} from '../../service/Service';
import m from 'mithril';

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

            if (albumID || songID) {
                this.mAlbum = null;
                const service = Service.activeService(serviceName ? serviceName : null);
                let p;
                if (albumID) {
                    p = service.getAlbumInfo(albumID);
                } else {
                    p = service.getAlbumForSong(songID);
                }
                p.then(result => {
                    console.log(result);
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
