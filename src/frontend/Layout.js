import { IBindable } from '../core/IBindable';
import { Header } from './header/Header';
import m from 'mithril';

export class Layout extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return [
            m(Header),
            this.content(),
        ];
    }

    content() {
        return m('div', 'Override this class!');
    }
}
