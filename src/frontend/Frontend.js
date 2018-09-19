import IObject from '../core/IObject';

import { Home, Import, Library, NowPlaying, Search } from './routes/Routes';
import m from 'mithril';

import { addTypography } from 'polythene-css';
addTypography();

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;
        // m.mount(this.mRoot, Search);
        m.route(this.mRoot, '/Home', {
            '/Home': Home,
            '/Library': Library,
            '/Import': Import,
            '/NowPlaying': NowPlaying,
            '/Search': Search,
        });
    }
}
