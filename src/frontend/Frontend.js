import IObject from '../core/IObject';

import { Home, Import, Library, NowPlaying, Search, Splash } from './routes';
import m from 'mithril';

import { applyFontStyle } from './FontStyler';
applyFontStyle();

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;
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
