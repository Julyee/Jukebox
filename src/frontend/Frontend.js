import IObject from '../core/IObject';

import { Search } from './routes/Search';
import { Home } from './routes/Home';
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
            '/Search': Search,
        });
    }
}
