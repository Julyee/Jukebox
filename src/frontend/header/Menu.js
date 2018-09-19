import { List, Drawer, ListTile } from 'polythene-mithril';
import { Events, Buttons } from '../Events';
import { EventCenter } from '../../core/EventCenter';
import { IBindable } from '../../core/IBindable';
// import stream from 'mithril/stream';
import m from 'mithril';

const navigationList = navItemClick =>
    m(List, {
        tiles: [
            m(ListTile, {
                title: 'Menu item 1',
                hoverable: true,
                navigation: true,
                events: {
                    onclick: () => {
                        window.location.href = '#!/Home';
                        navItemClick();
                    },
                },
            }),
            m(ListTile, {
                title: 'Menu item 2',
                hoverable: true,
                navigation: true,
                events: {
                    onclick: () => {
                        window.location.href = '#!/Home';
                        navItemClick();
                    },
                },
            }),
            m(ListTile, {
                title: 'Menu item 3',
                hoverable: true,
                navigation: true,
                events: {
                    onclick: () => {
                        window.location.href = '#!/Home';
                        navItemClick();
                    },
                },
            }),
        ],
    });

export class Menu extends IBindable {
    constructor(/* vnode */) {
        super();
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
                content: navigationList(navItemClick),
                fixed: true, // global drawer on top of everything
                backdrop: true,
                show: state.show,
                didHide: () => {
                    state.show = false;
                },
            }),
        ];
    }
}
