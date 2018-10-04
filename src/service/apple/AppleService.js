/* global MusicKit */

import {Events} from '../../frontend/Events';
import {Service} from '../Service';
import m from 'mithril';
import {EventCenter} from '../../core/EventCenter';
import {AppleSong} from './media/AppleSong';

const kPlaybackStateMap = {
    none: Events.SONG_IDLE,
    loading: Events.SONG_LOADING,
    playing: Events.SONG_PLAY,
    paused: Events.SONG_PAUSE,
    stopped: Events.SONG_STOP,
    ended: Events.SONG_END,
    seeking: Events.SONG_LOADING,
    waiting: Events.SONG_LOADING,
    stalled: Events.SONG_LOADING,
    completed: Events.SONG_COMPLETE,
};

export class AppleService extends Service {
    constructor() {
        super();
        this.mAPI = null;
        this.mAudioContext = null;
        this.mAudioContextSource = null;
        this.mSearchHintCache = {};
    }

    get authorized() {
        return this.mAPI.isAuthorized;
    }

    get bufferingProgress() {
        return this.mAPI.player.currentBufferedProgress;
    }

    get playbackProgress() {
        if (!isNaN(this.mAPI.player.currentPlaybackDuration) && this.mAPI.player.currentPlaybackDuration > 0) {
            return (this.mAPI.player.audio.currentTime / this.mAPI.player.currentPlaybackDuration) * 100;
        }
        return 0;
    }

    get isPlaying() {
        return this.mAPI.player.isPlaying;
    }

    get currentSong() {
        if (this.isPlaying) {
            return new AppleSong(this.mAPI.player.nowPlayingItem, this);
        } else if (
            !this.mAPI.player.queue.isEmpty &&
            (this.mAPI.player.playbackState === MusicKit.PlaybackStates.paused ||
            this.mAPI.player.playbackState === MusicKit.PlaybackStates.waiting)) {
            const queue = this.mAPI.player.queue;
            return new AppleSong(queue.items[queue.position], this);
        }
        return null;
    }

    get audioContext() {
        return this.mAudioContext;
    }

    get audioContextSource() {
        return this.mAudioContextSource;
    }

    async init(devTokenPath, appName, build) {
        const devToken = await m.request({
            method: 'GET',
            url: devTokenPath,
            deserialize: value => value,
        });
        this.mAPI = MusicKit.configure({
            developerToken: devToken,
            app: {
                name: appName,
                build: build,
            },
        });

        Object.keys(MusicKit.Events).forEach(key => this._registerPlayerEvent(MusicKit.Events[key]));

        this.mAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mAudioContextSource = this.mAudioContext.createMediaElementSource(this.mAPI.player.audio);
        this.mAudioContextSource.connect(this.mAudioContext.destination);
    }

    async authorize() {
        if (!this.authorized) {
            await this.mAPI.authorize();
        }
        return this.mAPI.musicUserToken;
    }

    async unauthorize() {
        if (this.authorized) {
            return await this.mAPI.unauthorize();
        }
        return true;
    }

    async search(term, resultCount = 5) {
        await this.authorize();
        const result = await this.mAPI.api.search(term, {
            limit: resultCount,
        });

        return Object.assign({}, {
            albums: result.albums ? result.albums.data : null,
            artists: result.artists ? result.artists.data : null,
            'music-videos': result['music-videos'] ? result['music-videos'].data : null,
            playlists: result.playlists ? result.playlists.data : null,
            songs: result.songs ? result.songs.data.map(song => new AppleSong(song, this)) : null,
        });
    }

    async searchHints(term) {
        if (!this.mSearchHintCache.hasOwnProperty(term)) {
            await this.authorize();
            this.mSearchHintCache[term] = await this.mAPI.api.searchHints(term);
        }

        return this.mSearchHintCache[term];
    }

    async play(song = null) {
        await this.authorize();
        if (this.isPlaying) {
            if (!song) {
                return true;
            }
            await this.stop();
        }

        if (song) {
            await this.queueSong(song, true);
        }

        return await this.mAPI.play();
    }

    async pause() {
        await this.authorize();
        if (this.isPlaying) {
            return await this.mAPI.pause();
        }
        return false;
    }

    async stop() {
        await this.authorize();
        if (this.isPlaying) {
            return await this.mAPI.stop();
        }
        return false;
    }

    async queueSong(song, overwriteQueue) {
        await this.authorize();
        if (!this.mAPI.player.queue || overwriteQueue) {
            return await this.mAPI.setQueue([
                song._descriptor,
            ]);
        }

        return await this.mAPI.player.queue.append([
            song._descriptor,
        ]);
    }

    async seekTo(time) {
        return await this.mAPI.seekToTime(time);
    }

    _registerPlayerEvent(event) {
        this.mAPI.player.addEventListener(event, (...varArgs) => this._handlePlayerEvent(event, ...varArgs));
    }

    _handlePlayerEvent(event, info) {
        const MKEvents = MusicKit.Events;
        switch (event) {
            case MKEvents.authorizationStatusDidChange:
                break;

            case MKEvents.authorizationStatusWillChange:
                break;

            case MKEvents.bufferedProgressDidChange:
                EventCenter.emit(Events.PLAYBACK_EVENT, Events.PLAYER_BUFFER_CHANGE, info.progress);
                break;

            case MKEvents.eligibleForSubscribeView:
                break;

            case MKEvents.loaded:
                break;

            case MKEvents.mediaCanPlay:
                break;

            case MKEvents.mediaItemDidChange:
                break;

            case MKEvents.mediaItemStateDidChange:
                break;

            case MKEvents.mediaItemStateWillChange:
                break;

            case MKEvents.mediaItemWillChange:
                break;

            case MKEvents.mediaPlaybackError:
                break;

            case MKEvents.metadataDidChange:
                break;

            case MKEvents.playbackBitrateDidChange:
                break;

            case MKEvents.playbackDurationDidChange:
                break;

            case MKEvents.playbackProgressDidChange:
                // EventCenter.emit(Events.PLAYER_TIME_CHANGE, info.progress);
                break;

            case MKEvents.playbackStateDidChange: {
                const States = MusicKit.PlaybackStates;
                if (States.hasOwnProperty(info.state) && kPlaybackStateMap[States[info.state]]) {
                    EventCenter.emit(Events.PLAYBACK_EVENT, kPlaybackStateMap[States[info.state]], info);
                }
                break;
            }

            case MKEvents.playbackStateWillChange:
                break;

            case MKEvents.playbackTargetAvailableDidChange:
                break;

            case MKEvents.playbackTimeDidChange:
                EventCenter.emit(Events.PLAYBACK_EVENT, Events.PLAYER_TIME_CHANGE, info.currentPlaybackDuration, info.currentPlaybackTime);
                break;

            case MKEvents.playbackVolumeDidChange:
                break;

            case MKEvents.primaryPlayerDidChange:
                break;

            case MKEvents.queueItemForStartPosition:
                break;

            case MKEvents.queueItemsDidChange:
                break;

            case MKEvents.queuePositionDidChange:
                break;

            case MKEvents.storefrontCountryCodeDidChange:
                break;

            case MKEvents.storefrontIdentifierDidChange:
                break;

            case MKEvents.userTokenDidChange:
                break;

            default:
                break;
        }
        // console.log([event, info]); // eslint-disable-line
    }
}
