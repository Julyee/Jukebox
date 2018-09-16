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

import { IBindable } from '../../core/IBindable';
import { Search, IconButton } from 'polythene-mithril';
import stream from 'mithril/stream';
import m from 'mithril';

import { SearchCSS, IconButtonCSS } from 'polythene-css';

SearchCSS.addStyle('.jukebox-search', {
    'font_size_input': 13,
    'inset_height': 26,
    'inset_side_padding': 2,
    'inset_input_indent': 5,
    'line_height_input': 26,
});

IconButtonCSS.addStyle('.jukebox-search-icon', {
    padding: 0,
});

const iconSearchSVG = '<svg width="24" height="24" viewBox="-4 -4 30 30"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
// const iconBackSVG = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
const iconClearSVG = '<svg width="24" height="24" viewBox="-4 -4 32 32"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

const iconSearch = m.trust(iconSearchSVG);
const iconClear = m.trust(iconClearSVG);

const SearchIcon = {
    view: () =>
        m(IconButton, {
            icon: { svg: { content: iconSearch } },
            inactive: true,
            className: 'jukebox-search-icon',
        }),
};

const ClearButton = {
    view: ({ attrs }) =>
        m(IconButton, {
            icon: { svg: { content: iconClear } },
            ink: false,
            events: { onclick: attrs.clear },
            className: 'jukebox-search-icon',
        }),
};

export class SearchBar extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    oninit(vnode) {
        const value = stream('');
        const setInputState = stream();

        const clear = () => setInputState()({ value: '', focus: true });

        const leave = () => value('');

        vnode.state = {
            value,
            setInputState,
            clear,
            leave,
        };
    }

    view({ state }) {
        const currentValue = state.value();
        return m(Search, {
            textfield: {
                label: 'Search',
                onChange: ({ newValue, setInputState }) => { state.value(newValue); state.setInputState(setInputState); },
                currentValue,
            },
            buttons: {
                none: {
                    before: m(SearchIcon),
                },
                focus: {
                    before: m(SearchIcon),
                },
                'focus_dirty': {
                    before: m(SearchIcon),
                    after: m(ClearButton, { clear: state.clear }),
                },
                dirty: {
                    before: m(SearchIcon),
                    after: m(ClearButton, { clear: state.clear }),
                },
            },
            // fullWidth: true,
            className: 'jukebox-search',
        });
    }
}
