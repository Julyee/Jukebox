import { Toolbar, ToolbarTitle, Shadow } from 'polythene-mithril';
import { IBindable } from '../../core/IBindable';
import { SearchBar } from './SearchBar';
import { Menu } from './Menu';
import m from 'mithril';

export class Header extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        const pathName = parsedUrl.pathname.split('/');
        return m('div', {style: {position: 'relative'}}, [
            m(Toolbar,
                [
                    m(Menu),
                    m(ToolbarTitle, { text: pathName[1], center: true, indent: true }),
                    m('.toolbar-search-bar', [
                        m(SearchBar),
                    ]),
                ]
            ),
            m(Shadow),
        ]);
    }
}
