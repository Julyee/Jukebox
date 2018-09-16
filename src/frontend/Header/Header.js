/**
 * Copyright (c) 2018 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Toolbar, ToolbarTitle, IconButton, Shadow } from 'polythene-mithril';
import { IBindable } from '../../core/IBindable';
import { SearchBar } from './SearchBar';
import m from 'mithril';

const iconMenuSVG = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
const toolbarButton = svg => m(IconButton, { icon: { svg } });

export class Header extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return m('div', {style: {position: 'relative'}}, [
            m(Toolbar,
                [
                    toolbarButton(m.trust(iconMenuSVG)),
                    m(ToolbarTitle, { text: 'Home', center: true, indent: true }),
                    m('.toolbar-search-bar', [
                        m(SearchBar),
                    ]),
                ]
            ),
            m(Shadow),
        ]);
    }
}
