import { IBindable } from '../core/IBindable';
import { Header } from './header/Header';
import { Menu } from './header/Menu';
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
            ]),
        ];
    }

    content() {
        return m('div', 'Override this class!');
    }
}
