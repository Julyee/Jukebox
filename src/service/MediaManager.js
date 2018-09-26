import {IBindable} from '../core/IBindable';
import {Service} from './Service';
import {EventCenter} from '../core/EventCenter';
import {Events, Buttons} from '../frontend/Events';

export class MediaManager extends IBindable {
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
        if (type === Buttons.PLAY_SONG_BUTTON) {
            Service.activeService().play(varArgs[0]);
        }
    }
}
