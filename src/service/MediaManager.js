import {Service} from './Service';
import {Dialog} from 'polythene-mithril';
import {IBindable} from '../core/IBindable';
import {EventCenter} from '../core/EventCenter';
import {Events, Buttons} from '../frontend/Events';
import {SongMoreDialog} from '../frontend/dialogs/SongMoreDialog';

let kSharedInstance = null;

export class MediaManager extends IBindable {
    static instance() {
        if (!kSharedInstance) {
            kSharedInstance = new MediaManager();
        }
        return kSharedInstance;
    }

    constructor() {
        super();
        this.mBoundEvents = {};
        this._registerEvent(Events.BUTTON_PRESS, (...varArgs) => this._handleButtonPress(...varArgs));
    }

    destroy() {
        const keys = Object.keys(this.mBoundEvents);
        keys.forEach(key => {
            this.mBoundEvents[key].forEach(handler => {
                EventCenter.off(key, handler);
            });
        });
        super.destroy();
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
                    service.play(varArgs[0]);
                    break;

                case Buttons.SONG_MORE:
                    Dialog.show(SongMoreDialog.get(varArgs[0]));
                    break;

                case Buttons.PLAYER_PLAY_BUTTON:
                    service.play();
                    break;

                case Buttons.PLAYER_PAUSE_BUTTON:
                    service.pause();
                    break;

                default:
                    break;
            }
        }
    }
}
