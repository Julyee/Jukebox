import {Service} from './Service';
import {Dialog} from 'polythene-mithril';
import {IBindable} from '../core/IBindable';
import {EventCenter} from '../core/EventCenter';
import {Events, Buttons} from '../frontend/Events';
import {SongMoreDialog} from '../frontend/dialogs/SongMoreDialog';
import {MusicQueue} from './MusicQueue';

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

    _registerEvent(event, handler) {
        if (!this.mBoundEvents.hasOwnProperty(event)) {
            this.mBoundEvents[event] = [];
        }
        this.mBoundEvents[event].push(EventCenter.on(event, handler));
    }

    _handleButtonPress(type, ...varArgs) {
        const service = Service.activeService();
        if (service) {
            switch (type) {
                case Buttons.SONG_PLAY_NOW:
                    this.mQueue.clearQueue();
                    // break; // fall through

                case Buttons.SONG_PLAY_KEEP_QUEUE:
                    this.mCurrentSong = varArgs[0];
                    this.mCurrentSong.play();
                    this.mQueue.history.push(this.mCurrentSong);
                    break;

                case Buttons.SONG_PLAY_NEXT:
                    this.mQueue.unshiftSong(varArgs[0]);
                    break;

                case Buttons.SONG_PLAY_LATER:
                    this.mQueue.enqueueSong(varArgs[0]);
                    break;

                case Buttons.SONG_MORE:
                    Dialog.show(SongMoreDialog.get(varArgs[0]));
                    break;

                case Buttons.PLAYER_PLAY_BUTTON:
                    if (this.mCurrentSong) {
                        this.mCurrentSong.service.play();
                    }
                    break;

                case Buttons.PLAYER_PAUSE_BUTTON:
                    if (this.mCurrentSong) {
                        this.mCurrentSong.service.pause();
                    }
                    break;

                case Buttons.PLAYER_NEXT_BUTTON:
                    if (this.mQueue.queueSize) {
                        this.mCurrentSong = this.mQueue.dequeueSong();
                        this.mCurrentSong.play();
                    }
                    break;

                case Buttons.PLAYER_PREVIOUS_BUTTON:
                    if (this.mCurrentSong) {
                        if (this.mCurrentSong.service.playbackProgress > 2 || this.mQueue.historySize <= 1) { // 2%
                            this.mCurrentSong.service.seekTo(0);
                        } else if (this.mQueue.historySize > 1) {
                            this.mQueue.unshiftSong(this.mQueue.history.pop());
                            this.mCurrentSong = this.mQueue.history[this.mQueue.historySize - 1];
                            this.mCurrentSong.play();
                        }
                    } else if (this.mQueue.historySize) {
                        this.mCurrentSong = this.mQueue.history[this.mQueue.historySize - 1];
                        this.mCurrentSong.play();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    _handlePlaybackEvent(type, ...varArgs) { // eslint-disable-line
        const service = Service.activeService();
        if (service) {
            if (type === Events.SONG_COMPLETE) {
                this.mCurrentSong = this.mQueue.dequeueSong();
                if (this.mCurrentSong) {
                    this.mCurrentSong.play();
                }
            }
        }
    }
}

export const MediaManager = MediaManagerImp.instance();
