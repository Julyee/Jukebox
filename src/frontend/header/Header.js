import { Toolbar, ToolbarTitle, IconButton } from 'polythene-mithril';
import { EventCenter } from '../../core/EventCenter';
import { IBindable } from '../../core/IBindable';
import { SearchBar } from './SearchBar';
import { Events, Buttons } from '../Events';
import { svgPathData as menuPathData } from '@fortawesome/free-solid-svg-icons/faBars';
import m from 'mithril';

const iconMenuSVG = `<svg width="24" height="24" viewBox="-40 -40 600 600"><path d="${menuPathData}"/></svg>`;
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
                m(ToolbarTitle, { text: pathName[1], center: true, indent: false }),
                m('.toolbar-search-bar', [
                    m(SearchBar),
                ]),
            ]),
        ]);
    }
}
