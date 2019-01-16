/* global MusicKit */

import {Events} from '../../frontend/Events';
import {Service} from '../Service';
import m from 'mithril';
import {EventCenter} from '../../core/EventCenter';
import {AppleSong} from './media/AppleSong';
import {AppleAlbum} from './media/AppleAlbum';
import {ApplePlaylist} from './media/ApplePlaylist';
import {JukeboxService} from '../jukebox/JukeboxService';
import {waitOneTick} from '../../core/nextTick';
import {LastFM} from '../recommendations/last.fm';
import similarity from 'string-similarity';

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
        this.mAudioSource = null;
        this.mAudioDelay = null;
        this.mSearchHintCache = {};
        this.mLastFM = new LastFM();
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

    get playbackTime() {
        if (!isNaN(this.mAPI.player.currentPlaybackDuration) && this.mAPI.player.currentPlaybackDuration > 0) {
            return this.mAPI.player.audio.currentTime;
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

    get audioSource() {
        return this.mAudioSource;
    }

    get audioDelay() {
        return this.mAudioDelay;
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
        await this.mLastFM.init('keys/last.fm.json');
    }

    async authorize() {
        if (!this.authorized) {
            await this._wrapPromiseCall(this.mAPI.authorize());
        }
        return this.mAPI.musicUserToken;
    }

    async unauthorize() {
        if (this.authorized) {
            return await this._wrapPromiseCall(this.mAPI.unauthorize());
        }
        return true;
    }

    async search(term, resultCount = 5, types = null) {
        await this.authorize();
        const options = {
            term: term,
            limit: resultCount,
        };

        if (types) {
            options.types = types;
        }

        const result = await this._wrapPromiseCall(this.mAPI.api.collection('catalog', 'search', null, options));

        if (result) {
            return Object.assign({}, {
                albums: result.albums ? result.albums.data.map(album => this._itemFromInfo(album)) : null,
                artists: result.artists ? result.artists.data.map(artist => this._itemFromInfo(artist)) : null,
                videos: result['music-videos'] ? result['music-videos'].data.map(video => this._itemFromInfo(video)) : null,
                playlists: result.playlists ? result.playlists.data.map(playlist => this._itemFromInfo(playlist)) : null,
                songs: result.songs ? result.songs.data.map(song => this._itemFromInfo(song)) : null,
            });
        }

        return null;
    }

    async searchHints(term) {
        if (!this.mSearchHintCache.hasOwnProperty(term)) {
            await this.authorize();
            const result = await this._wrapPromiseCall(this.mAPI.api.searchHints(term));
            if (result === null) {
                return null;
            }
            this.mSearchHintCache[term] = result;
        }

        return this.mSearchHintCache[term];
    }

    async play(song = null) {
        await this.authorize();
        if (!this.mAudioContext || !this.mAudioSource) {
            this._setupWebAudio();
            await waitOneTick();
        }

        if (this.isPlaying) {
            if (!song) {
                return true;
            }
            await this.stop();
            await waitOneTick();
        }

        if (song) {
            await this.queueSong(song, true);
            this._emitEvent(Events.PLAYBACK_EVENT, Events.SERVICE_PLAY_SONG, song);
        }

        await waitOneTick();
        return await this._wrapPromiseCall(this.mAPI.play());
    }

    async pause() {
        await this.authorize();
        if (this.isPlaying) {
            return await this._wrapPromiseCall(this.mAPI.pause());
        }
        return false;
    }

    async stop() {
        await this.authorize();
        if (this.isPlaying) {
            return await this._wrapPromiseCall(this.mAPI.stop());
        }
        return false;
    }

    async queueSong(song, overwriteQueue) {
        await this.authorize();
        if (!this.mAPI.player.queue || overwriteQueue) {
            const result = await this._wrapPromiseCall(this.mAPI.setQueue([
                song._descriptor,
            ]));
            await waitOneTick();
            return result;
        }

        const result = await this._wrapPromiseCall(this.mAPI.player.queue.append([
            song._descriptor,
        ]));
        await waitOneTick();
        return result;
    }

    async seekTo(time) {
        await this.authorize();
        return await this._wrapPromiseCall(this.mAPI.seekToTime(time));
    }

    async getHomeContent() {
        await this.authorize();
        const recommendations = await this._wrapPromiseCall(this.mAPI.api.recommendations());
        if (recommendations) {
            return this._itemsFromRecommendations(recommendations);
        }
        return null;
    }

    async getAlbumInfo(albumID) {
        await this.authorize();
        const album = await this._wrapPromiseCall(this.mAPI.api.album(albumID));
        if (album) {
            return new AppleAlbum(album, this);
        }
        return null;
    }

    async getAlbumForSong(songID) {
        await this.authorize();
        const song = await this._wrapPromiseCall(this.mAPI.api.song(songID));
        if (song) {
            const album = await this._wrapPromiseCall(this.mAPI.api.album(song.relationships.albums.data[0].id));
            if (album) {
                return new AppleAlbum(album, this);
            }
        }
        return null;
    }

    async getPlaylistInfo(playlistID) {
        await this.authorize();
        const playlist = await this._wrapPromiseCall(this.mAPI.api.playlist(playlistID));
        if (playlist) {
            return new ApplePlaylist(playlist, this);
        }
        return null;
    }

    async getRelatedSongs(song) {
        await this.authorize();
        const related = await this.mLastFM.getRecommendations(song);
        if (related) {
            const result = {
                serviceName: 'Last.fm',
                serviceURL: 'https://www.last.fm',
                songs: [],
            };

            for (let i = 0, n = related.length; i < n; ++i) {
                const s = await this._findSongByName(related[i].name, related[i].artist.name);
                if (s) {
                    result.songs.push(s);
                }
            }

            if (result.songs.length) {
                return result;
            }
        }

        return null;
    }

    _itemsFromRecommendations(recommendations, result = null) {
        const items = result ? result : [];
        recommendations.forEach(recommendation => {
            if (recommendation.relationships.hasOwnProperty('recommendations')) {
                this._itemsFromRecommendations(recommendation.relationships.recommendations.data, items);
            } else {
                const attributes = recommendation.attributes;
                if (attributes.resourceTypes.length === 1) {
                    const type = attributes.resourceTypes[0];
                    const name = attributes.title ? attributes.title.stringForDisplay : attributes.reason.stringForDisplay;
                    const typeName = this._typeNameForType(type);
                    items.push({
                        name,
                        type,
                        [typeName]: recommendation.relationships.contents.data.map(item => this._itemFromInfo(item)),
                    });
                }
            }
        });

        return items;
    }

    _itemFromInfo(info) {
        switch (info.type) {
            case 'albums':
                return new AppleAlbum(info, this);

            case 'artists':
                return info;

            case 'music-videos':
                return info;

            case 'playlists':
                return new ApplePlaylist(info, this);

            case 'songs':
                return new AppleSong(info, this);

            default:
                break;
        }
        return null;
    }

    _typeNameForType(type) {
        switch (type) {
            case 'albums':
            case 'artists':
            case 'playlists':
            case 'songs':
                return type;

            case 'music-videos':
                return 'videos';

            default:
                break;
        }
        return null;
    }

    _registerPlayerEvent(event) {
        this.mAPI.player.addEventListener(event, (...varArgs) => this._handlePlayerEvent(event, ...varArgs));
    }

    _emitEvent(...varArgs) {
        EventCenter.emit(...varArgs);
        JukeboxService.instance().forwardEvent(...varArgs);
    }

    _handlePlayerEvent(event, info) {
        const MKEvents = MusicKit.Events;
        switch (event) {
            case MKEvents.authorizationStatusDidChange:
                break;

            case MKEvents.authorizationStatusWillChange:
                break;

            case MKEvents.bufferedProgressDidChange:
                this._emitEvent(Events.PLAYBACK_EVENT, Events.PLAYER_BUFFER_CHANGE, info.progress);

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
                // this._emitEvent(Events.PLAYER_TIME_CHANGE, info.progress);
                break;

            case MKEvents.playbackStateDidChange: {
                const States = MusicKit.PlaybackStates;
                if (States.hasOwnProperty(info.state) && kPlaybackStateMap[States[info.state]]) {
                    this._emitEvent(Events.PLAYBACK_EVENT, kPlaybackStateMap[States[info.state]], info);
                }
                break;
            }

            case MKEvents.playbackStateWillChange:
                break;

            case MKEvents.playbackTargetAvailableDidChange:
                break;

            case MKEvents.playbackTimeDidChange:
                this._emitEvent(Events.PLAYBACK_EVENT, Events.PLAYER_TIME_CHANGE, info.currentPlaybackDuration, info.currentPlaybackTime);
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

    _setupWebAudio() {
        this.mAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mAudioSource = this.mAudioContext.createMediaElementSource(this.mAPI.player.audio);
        // this.mAudioSource.connect(this.mAudioContext.destination);

        // always delay the audio output by 0.25 seconds to account for speaker connections
        this.mAudioDelay = this.mAudioContext.createDelay(5.0);
        this.mAudioDelay.delayTime.value = 0.25;
        this.mAudioSource.connect(this.mAudioDelay);
        this.mAudioDelay.connect(this.mAudioContext.destination);
    }

    async _findSongByName(name, artist) {
        let results = await this.search(`${name} ${artist}`, 3, ['songs']);
        let songs = (results && results.songs) || null;
        let secondSearch = false;
        if (!songs) {
            results = await this.search(name);
            songs = (results && results.songs) || null;
            secondSearch = true;
        }

        if (songs) {
            let song = this._findSongBestMatch(songs, name, artist, 0.75);
            if (!song && !secondSearch) {
                results = await this.search(name);
                songs = (results && results.songs) || null;
                if (songs) {
                    song = this._findSongBestMatch(songs, name, artist, 0.75);
                }
            }
            return song;
        }

        return null;
    }

    _findSongBestMatch(songs, name, artist, threshold) {
        let highScore = 0;
        let bestMatch = null;

        let score;
        for (let i = 0, n = songs.length; i < n; ++i) {
            score = similarity.compareTwoStrings(name, songs[i].name) * 0.5;
            score += similarity.compareTwoStrings(artist, songs[i].artist) * 0.5;

            if (score > highScore) {
                highScore = score;
                bestMatch = songs[i];
            }
        }

        return highScore >= threshold ? bestMatch : null;
    }

    _wrapPromiseCall(promise) {
        return promise.catch(reason => {
            console.error(reason); // eslint-disable-line
            return null;
        });
    }
}
