import IObject from '../core/IObject';

import 'polythene-css';
import m from 'mithril';
import { Dialog, Button } from 'polythene-mithril';

const App = {
    view: () =>
        m('div', [
            m(Button, {
                raised: true,
                label: 'Open dialog',
                events: {
                    onclick: () => {
                        Dialog.show({
                            /* note the Dialog component is below the other elements in the app */
                            title: 'Hello',
                            body: 'Click background to hide or press ESCAPE.',
                            backdrop: true,
                        });
                    },
                },
            }),
            m(Dialog),
        ]),
};

export class Frontend extends IObject {
    constructor(root) {
        super();
        this.mRoot = root;
        m.mount(this.mRoot, App);
    }
}
