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
        this.mCurrentSong = null;
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
        delete this.mCurrentSong;
        delete this.mQueue;

        super.destroy();
    }

    get currentSong() {
        return this.mCurrentSong;
    }

    get queue() {
        return this.mQueue.queue;
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
                    this.mQueue.unshiftSong(mediaItems);
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.MEDIA_ITEM_PLAY_NEXT:
                mediaItems = varArgs[0] instanceof Song ? [varArgs[0]] : varArgs[0].songs;
                if (mediaItems && mediaItems.length) {
                    this.mQueue.unshiftSong(mediaItems);
                }

                if (!this.mCurrentSong) {
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.MEDIA_ITEM_PLAY_LAST:
                mediaItems = varArgs[0] instanceof Song ? [varArgs[0]] : varArgs[0].songs;
                if (mediaItems && mediaItems.length) {
                    this.mQueue.enqueueSong(mediaItems);
                }

                if (!this.mCurrentSong) {
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
                    this.mQueue.clearQueue();
                    this.mQueue.enqueueSong(mediaItems);
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.SONG_MORE:
                Dialog.show(MoreDialog.get(...varArgs));
                break;

            case Buttons.PLAYER_PLAY_BUTTON:
                if (this.mCurrentSong) {
                    this.mCurrentSong.service.play();
                } else if (this.mQueue.historySize) {
                    this._playSong(this.mQueue.history.pop());
                }
                break;

            case Buttons.PLAYER_PAUSE_BUTTON:
                if (this.mCurrentSong) {
                    this.mCurrentSong.service.pause();
                }
                break;

            case Buttons.PLAYER_NEXT_BUTTON:
                if (this.mQueue.queueSize) {
                    this._playSong(this.mQueue.dequeueSong());
                }
                break;

            case Buttons.PLAYER_PREVIOUS_BUTTON:
                if (this.mCurrentSong) {
                    if (this.mCurrentSong.service.playbackProgress * this.mCurrentSong.duration * 0.01 > 2000 || // 2 seconds
                        this.mQueue.historySize <= 1) {
                        this.mCurrentSong.service.seekTo(0);
                    } else if (this.mQueue.historySize > 1) {
                        this.mQueue.unshiftSong(this.mQueue.history.pop());
                        this._playSong(this.mQueue.history.pop());
                    }
                } else if (this.mQueue.historySize) {
                    this._playSong(this.mQueue.history.pop());
                    this.mCurrentSong.play();
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
    }

    _handlePlaybackEvent(type, ...varArgs) { // eslint-disable-line
        const service = Service.activeService();
        if (service) {
            if (type === Events.SONG_COMPLETE) {
                nextTick(() => this._playSong(this.mQueue.dequeueSong()));
            } else if (type === Events.PLAYER_SEEK_TO) {
                if (this.mCurrentSong) {
                    this.mCurrentSong.service.seekTo(varArgs[0]);
                }
            }
        }
    }

    _playSong(song) {
        this.mCurrentSong = song;
        if (this.mCurrentSong) {
            this.mCurrentSong.play();
            this.mQueue.history.push(this.mCurrentSong);
        }
    }
}

export const MediaManager = MediaManagerImp.instance();
