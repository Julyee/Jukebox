import { Dialog } from 'polythene-mithril';
import { Header } from './header/Header';
import { Menu } from './header/Menu';
import { Player } from './player/Player';
import { Service } from '../service/Service';
import m from 'mithril';

export class Layout {
    constructor(/* vnode */) {
        // init
    }

    oncreate() {
        if (!(Service.activeService() instanceof Service)) {
            window.location.href = '#!/Splash';
        }
    }

    view() {
        return [
            m('.main-container', [
                m(Header),
                m('.main-area', [
                    m('.menu-container', [
                        m(Menu),
                    ]),
                    m('.main-content', [
                        this.content(),
                    ]),
                ]),
                m(Player),
            ]),
            m(Dialog),
        ];
    }

    content() {
        return m('div', 'Override this class!');
    }
}
