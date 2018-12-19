import m from 'mithril';
import QRious from 'qrious';
import {Service} from '../Service';
import {JukeboxConnection} from './JukeboxConnection';
import {EventCenter} from '../../core/EventCenter';
import {Events} from '../../frontend/Events';
import {MediaManager} from '../MediaManager';

export class JukeboxService extends Service {
    constructor() {
        super();
        this.mConnection = new JukeboxConnection(this);
        this.mConnectURL = null;
        this.mConnectQR = null;
        this.mBaseService = null;
        this.mSpeakerStream = null;
        this.mAudioContext = null;
        this.mAudioSource = null;
        this.mAudioDelay = null;
        this.mAudioAnalyser = null;

        this.mBufferingProgress = 0;
        this.mPlaybackProgress = 0;
        this.mIsPlaying = false;
        this.mCurrentSong = null;
    }

    get canServeJukebox() {
        return false;
    }

    get connectQR() {
        return this.mConnectQR;
    }

    get connectURL() {
        return this.mConnectURL;
    }

    get connectAlias() {
        return this.mConnection.alias;
    }

    get authorized() {
        return this.mConnection.connected;
    }

    get isSpeaker() {
        return this.mConnection.isSpeaker;
    }

    get isSpeakerPlaying() {
        return (this.isSpeaker && this.mSpeakerStream && this.mAudioContext && this.mAudioSource);
    }


    get bufferingProgress() {
        return this.mBufferingProgress;
    }

    get playbackProgress() {
        return this.mPlaybackProgress;
    }

    get isPlaying() {
        return this.mIsPlaying;
    }

    get currentSong() {
        if (this.mBaseService && this.mConnection.isServer) {
            return this.mBaseService.currentSong;
        }

        if (this.mCurrentSong instanceof Promise) {
            return null;
        }

        return this.mCurrentSong;
    }

    get audioContext() {
        return this.mAudioContext;
    }

    get audioSource() {
        return this.mAudioSource;
    }

    get audioDelay() {
        return this.mAudioDelay;
    }

    get audioAnalyser() {
        return this.mAudioAnalyser;
    }

    async configureAsServer(service) {
        if (service.canServeJukebox) {
            if (await this.mConnection.initAsServer()) {
                const parsedUrl = new URL(window.location);
                let hostname = parsedUrl.hostname;
                if (hostname === 'localhost') {
                    hostname = '10.0.1.44';
                }
                this.mConnectURL = `${parsedUrl.protocol}//${hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}/#!/Splash?h=${this.mConnection.alias}`;
                const qr = new QRious({
                    value: this.mConnectURL,
                    size: 180,
                });
                this.mConnectQR = qr.toDataURL();
                this.mBaseService = service;
                return true;
            }
        }
        return false;
    }

    async configureAsClient(hostAlias) {
        return await this.mConnection.initAsClient(hostAlias);
    }

    async configureAsSpeaker(hostAlias) {
        return await this.mConnection.initAsSpeaker(hostAlias);
    }

    forwardEvent(...varArgs) {
        this.mConnection.forwardEvent(...varArgs);
    }

    async search(term, resultCount = 5) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.search(term, resultCount);
        }
        return await this.mConnection.performMethod('search', term, resultCount);
    }

    async searchHints(term) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.searchHints(term);
        }
        return await this.mConnection.performMethod('searchHints', term);
    }

    async play() {
        if (this.mConnection.isServer) {
            return await this.mBaseService.play();
        }
        return await this.mConnection.performMethod('play');
    }

    async pause() {
        if (this.mConnection.isServer) {
            return await this.mBaseService.pause();
        }
        return await this.mConnection.performMethod('pause');
    }

    async stop() {
        if (this.mConnection.isServer) {
            return await this.mBaseService.stop();
        }
        return await this.mConnection.performMethod('stop');
    }

    async queueSong(song, overwriteQueue) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.queueSong(song, overwriteQueue);
        }
        return await this.mConnection.performMethod('queueSong', song, overwriteQueue);
    }

    async seekTo(time) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.seekTo(time);
        }
        return await this.mConnection.performMethod('seekTo', time);
    }

    async getHomeContent() {
        if (this.mConnection.isServer) {
            return await this.mBaseService.getHomeContent();
        }
        return await this.mConnection.performMethod('getHomeContent');
    }

    async getAlbumInfo(albumID) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.getAlbumInfo(albumID);
        }
        return await this.mConnection.performMethod('getAlbumInfo', albumID);
    }

    async getAlbumForSong(songID) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.getAlbumForSong(songID);
        }
        return await this.mConnection.performMethod('getAlbumForSong', songID);
    }

    async getPlaylistInfo(playlistID) {
        if (this.mConnection.isServer) {
            return await this.mBaseService.getPlaylistInfo(playlistID);
        }
        return await this.mConnection.performMethod('getPlaylistInfo', playlistID);
    }

    setupSpeakerAudio() {
        if (!this.isSpeakerPlaying && this.isSpeaker && this.mSpeakerStream) {
            this.mAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.mAudioSource = this.mAudioContext.createMediaStreamSource(this.mSpeakerStream);
            // this.mAudioSource.connect(this.mAudioContext.destination);

            this.mAudioDelay = this.mAudioContext.createDelay(5.0);
            this.mAudioDelay.delayTime.value = 0.1; // just for giggles
            this.mAudioSource.connect(this.mAudioDelay);
            // this.mAudioDelay.connect(this.mAudioContext.destination);

            this.mAudioAnalyser = this.mAudioContext.createAnalyser();
            this.mAudioDelay.connect(this.mAudioAnalyser);
            this.mAudioAnalyser.connect(this.mAudioContext.destination);
        }
    }

    _handleForwardedEvent(event, varArgs) {
        if (event === Events.PLAYBACK_EVENT) {
            switch (varArgs[0]) {
                case Events.SONG_END:
                case Events.SONG_COMPLETE:
                    this.mCurrentSong = null;
                    // fallthrough

                case Events.SONG_IDLE:
                case Events.SONG_PAUSE:
                case Events.SONG_STOP:
                    this.mIsPlaying = false;
                    break;

                case Events.PLAYER_BUFFER_CHANGE:
                    this.mBufferingProgress = varArgs[1];
                    break;

                case Events.PLAYER_TIME_CHANGE:
                    this.mPlaybackProgress = (varArgs[2] / varArgs[1]) * 100;
                    // fallthrough

                case Events.SERVICE_PLAY_SONG:
                    this.mCurrentSong = this.mConnection.performMethod('getCurrentSong').then(value => {
                        this.mCurrentSong = value;
                        MediaManager.mCurrentSong = value;
                        m.redraw();
                    });
                    break;

                case Events.SONG_PLAY:
                    this.mIsPlaying = true;
                    if (!this.mCurrentSong) {
                        this.mCurrentSong = this.mConnection.performMethod('getCurrentSong').then(value => {
                            this.mCurrentSong = value;
                            MediaManager.mCurrentSong = value;
                            m.redraw();
                        });
                    }
                    break;

                default:
                    break;
            }
        }
        EventCenter.emit(event, ...varArgs);
    }

    _getSpeakerStream() {
        if (this.mConnection.isServer) {
            if (!this.mBaseService.audioContext || !this.mBaseService.audioSource) {
                this.mBaseService._setupWebAudio();
            }

            if (!this.mSpeakerStream) {
                const context = this.mBaseService.audioContext;
                const source = this.mBaseService.audioSource;
                this.mSpeakerStream = context.createMediaStreamDestination();
                source.connect(this.mSpeakerStream);
            }
            return this.mSpeakerStream.stream;
        }
        return null;
    }
}
