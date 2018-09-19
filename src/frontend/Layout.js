import { IBindable } from '../core/IBindable';
import { Header } from './header/Header';
import { Menu } from './header/Menu';
import { Player } from './player/Player';
import m from 'mithril';

export class Layout extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return [
            m('.main-container', [
                m(Header),
                m('.main-content', [
                    m('.menu-container', [
                        m(Menu),
                    ]),
                    this.content(),
                ]),
                m(Player),
            ]),
        ];
    }

    content() {
        return m('div', 'Override this class!');
    }
}
