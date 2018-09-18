import { List, Drawer, IconButton, ListTile } from 'polythene-mithril';
import { IBindable } from '../../core/IBindable';
// import stream from 'mithril/stream';
import m from 'mithril';

const iconMenuSVG = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
const toolbarButton = (svg, state) => m(IconButton, {
    icon: { svg },
    events: {
        onclick: () => {
            state.show = true;
        },
    },
});

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

    view({ state }) {
        const navItemClick = () => {
            state.show = false;
        };

        return [
            toolbarButton(m.trust(iconMenuSVG), state),
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
