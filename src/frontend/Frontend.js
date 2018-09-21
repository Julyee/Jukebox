import IObject from '../core/IObject';

import { Home, Import, Library, NowPlaying, Search, Splash } from './routes/Routes';
import m from 'mithril';

import { addTypography, addLayoutStyles } from 'polythene-css';
addTypography();
addLayoutStyles();

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;
        // m.mount(this.mRoot, Search);
        m.route(this.mRoot, '/Splash', {
            '/Splash': Splash,
            '/Home': Home,
            '/Library': Library,
            '/Import': Import,
            '/NowPlaying': NowPlaying,
            '/Search': Search,
        });
    }
}
