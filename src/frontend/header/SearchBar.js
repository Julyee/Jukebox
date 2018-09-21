import { IBindable } from '../../core/IBindable';
import { Search, IconButton } from 'polythene-mithril';
import { svgPathData as searchPathData } from '@fortawesome/free-solid-svg-icons/faSearch';
import { svgPathData as clearPathData } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
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

const iconSearchSVG = `<svg width="24" height="24" viewBox="-150 -150 800 800"><path d="${searchPathData}"/></svg>`;
const iconClearSVG = `<svg width="24" height="24" viewBox="-150 -150 800 800"><path d="${clearPathData}"/></svg>`;

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
                label: 'search...',
                onChange: ({ value, setInputState }) => { state.value(value); state.setInputState(setInputState); },
                currentValue,
            },
            events: {
                onkeyup: e => {
                    if (e.keyCode === 13) {
                        const value = state.value();
                        if (value) {
                            window.location.href = `#!/Search?q=${encodeURI(state.value())}`;
                        }
                    }
                },
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
