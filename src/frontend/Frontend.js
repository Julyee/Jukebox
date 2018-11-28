import IObject from '../core/IObject';

import * as routes from './routes';
import m from 'mithril';

import { applyFontStyle } from './FontStyler';
applyFontStyle();

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;

        const routesInfo = {};
        let defaultRoute = null;
        Object.keys(routes).forEach(key => {
            if (key !== 'default') {
                routesInfo[`/${key}`] = routes[key];
                if (routes[key] === routes.default) {
                    defaultRoute = `/${key}`;
                }
            }
        });

        m.route(this.mRoot, defaultRoute, routesInfo);
    }
}
