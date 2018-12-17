import { List, Drawer, ListTile } from 'polythene-mithril';
import { Events, Buttons } from '../Events';
import { EventCenter } from '../../core/EventCenter';
import {JukeboxService} from '../../service/jukebox/JukeboxService';
// import stream from 'mithril/stream';
import m from 'mithril';

const navigationList = (navItemClick, buttons) => {
    const jukebox = JukeboxService.instance();
    const tiles = [
        m(ListTile, {
            title: 'Jukebox!',
            hoverable: false,
            navigation: false,
        }),
    ];

    buttons.forEach(button => {
        tiles.push(
            m(ListTile, {
                title: button.title,
                hoverable: true,
                disabled: button.disabled,
                navigation: true,
                events: {
                    onclick: () => {
                        m.route.set(button.href);
                        navItemClick();
                    },
                },
            }),
        );
    });

    if (jukebox.connectQR || jukebox.connectAlias) {
        tiles.push(m(ListTile, {
            hoverable: false,
            navigation: false,
            content: m('.menu-connect-container', [
                jukebox.connectQR ? m('.menu-qr-code', m('img', { src: jukebox.connectQR })) : null,
                jukebox.connectAlias ? m('.menu-connect-alias', jukebox.connectAlias) : null,
            ]),
        }));
    }

    return m(List, {
        tiles,
    });
};

export class Menu {
    constructor(/* vnode */) {
        // init
    }

    oninit(vnode) {
        vnode.state.show = false;
    }

    oncreate(vnode) {
        vnode.state.showEvent = EventCenter.on(Events.BUTTON_PRESS, type => {
            if (type === Buttons.DRAWER_BUTTON) {
                vnode.state.show = !vnode.state.show;
            }
        });
    }

    onremove(vnode) {
        if (vnode.state.showEvent) {
            EventCenter.off(Events.BUTTON_PRESS, vnode.state.showEvent);
            delete vnode.state.showEvent;
        }
    }

    view({ state }) {
        const navItemClick = () => {
            state.show = false;
        };

        return [
            m(Drawer, {
                content: navigationList(navItemClick, [
                    {
                        title: 'Home',
                        href: '/Home',
                    },
                    {
                        title: 'Library',
                        href: '/Library',
                        disabled: true,
                    },
                    {
                        title: 'Import',
                        href: '/Import',
                        disabled: true,
                    },
                    {
                        title: 'Now Playing',
                        href: '/NowPlaying',
                    },
                ]),
                fixed: false, // global drawer on top of everything
                backdrop: true,
                show: state.show,
                didHide: () => {
                    state.show = false;
                },
                class: 'menu-input',
            }),
        ];
    }
}
