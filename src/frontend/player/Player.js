import { IBindable } from '../../core/IBindable';
import m from 'mithril';

export class Player extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return m('.player-container',
            [
                m('div', { style: { 'text-align': 'center' }}, 'Player!'),
            ],
        );
    }
}
