import {Service} from './Service';
import {Dialog} from 'polythene-mithril';
import {IBindable} from '../core/IBindable';
import {EventCenter} from '../core/EventCenter';
import {Events, Buttons} from '../frontend/Events';
import {MoreDialog} from '../frontend/dialogs/MoreDialog';
import {MusicQueue} from './MusicQueue';
import {Song} from './media';
import {JukeboxService} from './jukebox/JukeboxService';
import nextTick from '../core/nextTick';
import m from 'mithril';

let kSharedInstance = null;

export class MediaManagerImp extends IBindable {
    static instance() {
        if (!kSharedInstance) {
            kSharedInstance = new MediaManagerImp();
        }
        return kSharedInstance;
    }

    constructor() {
        super();
        this.mBoundEvents = {};
        this.mCurrenItem = null;
        this.mQueue = new MusicQueue();

        this._registerEvent(Events.BUTTON_PRESS, (...varArgs) => this._handleButtonPress(...varArgs));
        this._registerEvent(Events.PLAYBACK_EVENT, (...varArgs) => this._handlePlaybackEvent(...varArgs));
    }

    destroy() {
        const keys = Object.keys(this.mBoundEvents);
        keys.forEach(key => {
            this.mBoundEvents[key].forEach(handler => {
                EventCenter.off(key, handler);
            });
        });

        this.mQueue.release();

        delete this.mBoundEvents;
        delete this.mCurrenItem;
        delete this.mQueue;

        super.destroy();
    }

    get currentSong() {
        if (this.mCurrenItem) {
            return this.mCurrenItem.song;
        }
        return null;
    }

    get queue() {
        return this.mQueue;
    }

    get history() {
        return this.mQueue.history;
    }

    _registerEvent(event, handler) {
        if (!this.mBoundEvents.hasOwnProperty(event)) {
            this.mBoundEvents[event] = [];
        }
        this.mBoundEvents[event].push(EventCenter.on(event, handler));
    }

    _handleButtonPress(type, ...varArgs) {
        const service = Service.activeService();
        if (service) {
            if (service instanceof JukeboxService) {
                this._handleButtonPressJukebox(service, type, ...varArgs);
            } else {
                this._handleButtonPressLocal(service, type, ...varArgs);
            }
        }
    }

    _handleButtonPressJukebox(service, type, ...varArgs) {
        switch (type) {
            case Buttons.MEDIA_ITEM_PLAY_NOW:
            case Buttons.MEDIA_ITEM_PLAY_KEEP_QUEUE:
            case Buttons.MEDIA_ITEM_PLAY_NEXT:
            case Buttons.MEDIA_ITEM_PLAY_LAST:
            case Buttons.MEDIA_ITEM_SHUFFLE:
            case Buttons.PLAYER_PLAY_BUTTON:
            case Buttons.PLAYER_PAUSE_BUTTON:
            case Buttons.PLAYER_NEXT_BUTTON:
            case Buttons.PLAYER_PREVIOUS_BUTTON:
                varArgs.push('remote');
                service.forwardEvent(Events.BUTTON_PRESS, type, ...varArgs);
                break;

            case Buttons.SONG_MORE:
                Dialog.show(MoreDialog.get(...varArgs));
                break;

            case Buttons.SONG_GO_TO_ALBUM:
            case Buttons.ALBUM_OPEN_VIEW:
            case Buttons.PLAYLIST_OPEN_VIEW:
                this._handleButtonPressLocal(service, type, ...varArgs);
                break;

            case Buttons.SPEAKER_START_STREAMING:
                if (service.isSpeaker) {
                    service.setupSpeakerAudio();
                }
                break;

            default:
                break;
        }
    }

    _handleButtonPressLocal(service, type, ...varArgs) {
        let mediaItems = null;
        switch (type) {
            case Buttons.MEDIA_ITEM_PLAY_NOW:
                this.mQueue.clearQueue();
                // break; // fall through

            case Buttons.MEDIA_ITEM_PLAY_KEEP_QUEUE:
                mediaItems = varArgs[0] instanceof Song ? [varArgs[0]] : varArgs[0].songs;
                if (mediaItems && mediaItems.length) {
                    const items = this._wrapMediaItems(mediaItems, varArgs[1]);
                    this.mQueue.unshiftSong(items);
                    if (this.mQueue.queue[this.mQueue.queueSize - 1] === items[items.length - 1]) {
                        this.mQueue.clearRecommendations();
                        this._updateRecommendations(items[items.length - 1]);
                    }
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.MEDIA_ITEM_PLAY_NEXT:
                mediaItems = varArgs[0] instanceof Song ? [varArgs[0]] : varArgs[0].songs;
                if (mediaItems && mediaItems.length) {
                    const items = this._wrapMediaItems(mediaItems, varArgs[1]);
                    this.mQueue.unshiftSong(items);
                    if (this.mQueue.queue[this.mQueue.queueSize - 1] === items[items.length - 1]) {
                        this.mQueue.clearRecommendations();
                        this._updateRecommendations(items[items.length - 1]);
                    }
                }

                if (!this.mCurrenItem) {
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.MEDIA_ITEM_PLAY_LAST:
                mediaItems = varArgs[0] instanceof Song ? [varArgs[0]] : varArgs[0].songs;
                if (mediaItems && mediaItems.length) {
                    const items = this._wrapMediaItems(mediaItems, varArgs[1]);
                    this.mQueue.enqueueSong(items);
                    this.mQueue.clearRecommendations();
                    this._updateRecommendations(items[items.length - 1]);
                }

                if (!this.mCurrenItem) {
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.MEDIA_ITEM_SHUFFLE:
                if (varArgs[0].songs && varArgs[0].songs.length) {
                    mediaItems = varArgs[0].songs.slice();
                    let j;
                    let x;
                    let i;
                    for (i = mediaItems.length - 1; i > 0; i--) {
                        j = Math.floor(Math.random() * (i + 1));
                        x = mediaItems[i];
                        mediaItems[i] = mediaItems[j];
                        mediaItems[j] = x;
                    }

                    const items = this._wrapMediaItems(mediaItems, varArgs[1]);
                    this.mQueue.clearQueue();
                    this.mQueue.enqueueSong(items);
                    this._playSong(this.mQueue.dequeueSong());
                    this._updateRecommendations(items[items.length - 1]);
                }
                break;

            case Buttons.SONG_MORE:
                Dialog.show(MoreDialog.get(...varArgs));
                break;

            case Buttons.PLAYER_PLAY_BUTTON:
                if (this.mCurrenItem) {
                    this.currentSong.service.play();
                } else if (this.mQueue.historySize) {
                    this._playSong(this.mQueue.history.pop());
                }
                break;

            case Buttons.PLAYER_PAUSE_BUTTON:
                if (this.mCurrenItem) {
                    this.currentSong.service.pause();
                }
                break;

            case Buttons.PLAYER_NEXT_BUTTON:
                if (this.mQueue.queueSize) {
                    this._playSong(this.mQueue.dequeueSong());
                } else if (this.mQueue.recommendationsQueue.length) {
                    this._playSong(this.mQueue.dequeueRecommendation());
                }
                break;

            case Buttons.PLAYER_PREVIOUS_BUTTON:
                if (this.mCurrenItem) {
                    if (this.currentSong.service.playbackProgress * this.currentSong.duration * 0.01 > 2000 || // 2 seconds
                        this.mQueue.historySize <= 1) {
                        this.currentSong.service.seekTo(0);
                    } else if (this.mQueue.historySize > 1) {
                        this.mQueue.unshiftSong(this.mQueue.history.pop());
                        this._playSong(this.mQueue.history.pop());
                    }
                } else if (this.mQueue.historySize) {
                    this._playSong(this.mQueue.history.pop());
                }
                break;

            case Buttons.SONG_GO_TO_ALBUM: {
                const song = varArgs[0];
                m.route.set('/Album', { s: song.id, x: song.service.constructor.name});
                break;
            }

            case Buttons.ALBUM_OPEN_VIEW: {
                const album = varArgs[0];
                m.route.set('/Album', { a: album.id, x: album.service.constructor.name});
                break;
            }

            case Buttons.PLAYLIST_OPEN_VIEW: {
                const playlist = varArgs[0];
                m.route.set('/Playlist', {p: playlist.id, x: playlist.service.constructor.name});
                break;
            }

            default:
                break;
        }
        m.redraw();
    }

    _handlePlaybackEvent(type, ...varArgs) { // eslint-disable-line
        const service = Service.activeService();
        if (service) {
            if (type === Events.SONG_COMPLETE) {
                if (this.mCurrenItem) {
                    this.mCurrenItem.state = 'completed';
                }
                nextTick(() => this._playSong(this.mQueue.dequeueSong() || this.mQueue.dequeueRecommendation()));
            } else if (type === Events.PLAYER_SEEK_TO) {
                if (this.mCurrenItem) {
                    this.currentSong.service.seekTo(varArgs[0]);
                }
            }
        }
    }

    _playSong(item) {
        this._updateCurrentItemState();
        this.mCurrenItem = item;
        if (this.mCurrenItem) {
            this.currentSong.play();
            this.mQueue.history.push(this.mCurrenItem);
            if (
                this.mQueue.queueSize === 0 &&
                this.mQueue.recommendationsQueue.length <= 3 &&
                this.mQueue.recommendationsQueue.length > 0
            ) {
                this._updateRecommendations(this.mQueue.recommendationsQueue[this.mQueue.recommendationsQueue.length - 1]);
            }
        }
    }

    _updateRecommendations(item) {
        item.song.service.getRelatedSongs(item.song)
            .then(result => {
                if (
                    result && (
                        (
                            this.mQueue.queueSize === 0 && (
                                this.mCurrenItem === item ||
                                this.mQueue.recommendationsQueue[this.mQueue.recommendationsQueue.length - 1] === item
                            )
                        ) ||
                        (this.mQueue.queue[this.mQueue.queueSize - 1] === item)
                    )
                ) {
                    this.mQueue.updateRecommendations(this._wrapMediaItems(result.songs, result.serviceName, true));
                    m.redraw();
                }
            });
    }

    _updateCurrentItemState() {
        if (this.mCurrenItem && this.mCurrenItem.state !== 'completed') {
            if (this.currentSong.service.playbackProgress >= 80) {
                this.mCurrenItem.state = 'completed';
            } else {
                this.mCurrenItem.state = 'skipped';
            }
        }
    }

    _wrapMediaItems(items, origin, isRecommendation = false) {
        return items.map(item => ({
            state: 'queued',
            origin: origin ? origin : 'Jukebox',
            isRecommendation,
            song: item,
        }));
    }
}

export const MediaManager = MediaManagerImp.instance();
