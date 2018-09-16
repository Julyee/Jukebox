import IObject from '../core/IObject';

import { Layout } from './Layout';
import m from 'mithril';

import { addTypography } from 'polythene-css';
addTypography();

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;
        m.mount(this.mRoot, Layout);
    }
}
