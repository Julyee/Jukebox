import { Service } from '../../service/Service';
import { Search, IconButton, List, ListTile } from 'polythene-mithril';
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

export class SearchBar {
    constructor(/* vnode */) {
        // init
    }

    oninit(vnode) {
        const value = stream('');
        const setInputState = stream();
        const matches = stream([]);
        const clear = (focus = true) => { setInputState()({ value: '', focus: focus }); matches([]); };
        const leave = () => value('');
        const handleKeyUp = e => {
            if (e.keyCode === 13) {
                if (value) {
                    window.location.href = `#!/Search?q=${encodeURI(value())}`;
                    clear(false);
                }
            } else if (value()) {
                Service.activeService().searchHints(value()).then(result => {
                    matches(result.terms);
                    m.redraw();
                });
            } else {
                matches([]);
            }
        };

        vnode.state = {
            value,
            setInputState,
            clear,
            leave,
            matches,
            handleKeyUp,
            focus: false,
        };
    }

    view({ state }) {
        const currentValue = state.value();
        const matches = state.matches();
        return m('.toolbar-search-container', [
            m(Search, {
                textfield: {
                    label: 'search...',
                    onChange: ({value, setInputState}) => {
                        state.value(value);
                        state.setInputState(setInputState);
                    },
                    events: {
                        onfocus: () => { state.focus = true; },
                        onblur: () => { state.focus = false; },
                    },
                    currentValue,
                },
                events: {
                    onkeyup: state.handleKeyUp,
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
                        after: m(ClearButton, {clear: state.clear}),
                    },
                    dirty: {
                        before: m(SearchIcon),
                        after: m(ClearButton, {clear: state.clear}),
                    },
                },
                // fullWidth: true,
                className: 'jukebox-search',
            }),
            state.focus && matches.length && state.value() ?
                m('.toolbar-search-hints', [
                    m(List, {
                        border: true,
                        indentedBorder: false,
                        compact: false,
                        padding: 'none',
                        tiles: matches.map(match => m(ListTile, {
                            title: match,
                            hoverable: true,
                            navigation: true,
                            compact: true,
                            events: {
                                onmousedown: () => {
                                    state.clear(false);
                                    window.location.href = `#!/Search?q=${encodeURI(match)}`;
                                },
                            },
                        })),
                    }),
                ]) : null,
        ]);
    }
}
