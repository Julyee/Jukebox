import { Toolbar, ToolbarTitle, IconButton } from 'polythene-mithril';
import { EventCenter } from '../../core/EventCenter';
import { IBindable } from '../../core/IBindable';
import { SearchBar } from './SearchBar';
import { Events, Buttons } from '../Events';
import m from 'mithril';

const iconMenuSVG = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
const toolbarButton = svg => m(IconButton, {
    icon: { svg },
    events: {
        onclick: () => {
            EventCenter.emit(Events.BUTTON_PRESS, Buttons.DRAWER_BUTTON);
        },
    },
});

export class Header extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        const pathName = parsedUrl.pathname.split('/');
        return m('div', {style: {position: 'relative'}}, [
            m(Toolbar, {
                fullbleed: true,
                border: true,
                compact: true,
            },
            [
                toolbarButton(m.trust(iconMenuSVG)),
                m(ToolbarTitle, { text: pathName[1], center: true, indent: true }),
                m('.toolbar-search-bar', [
                    m(SearchBar),
                ]),
            ]),
        ]);
    }
}
