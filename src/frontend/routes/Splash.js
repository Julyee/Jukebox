import {Icon, List, ListTile, Button, Dialog} from 'polythene-mithril';
import { IBindable } from '../../core/IBindable';
import m from 'mithril';

import {svgPathData as applePathData} from '@fortawesome/free-brands-svg-icons/faApple';
import {svgPathData as paypalPathData} from '@fortawesome/free-brands-svg-icons/faPaypal';
import {svgPathData as patreonPathData} from '@fortawesome/free-brands-svg-icons/faPatreon';
import {svgPathData as jukeboxPathData} from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import {svgPathData as warningPathData} from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';

const iconApple = m.trust(`<svg width="280" height="280" viewBox="-110 -40 600 600"><path d="${applePathData}"/></svg>`);
const iconPayPal = m.trust(`<svg width="280" height="280" viewBox="-110 -40 600 600"><path d="${paypalPathData}"/></svg>`);
const iconPatreon = m.trust(`<svg width="280" height="280" viewBox="-30 -40 600 600"><path d="${patreonPathData}"/></svg>`);
const iconJukebox = m.trust(`<svg width="280" height="280" viewBox="-40 -40 600 600"><path d="${jukeboxPathData}"/></svg>`);
const warningJukebox = m.trust(`<svg width="280" height="280" viewBox="-10 -40 600 600"><path d="${warningPathData}"/></svg>`);

const comingSoonDialog = {
    title: [
        m(Icon, {
            svg: warningJukebox,
            size: 'large',
        }),
        ' Coming Soon',
    ],
    body: m.trust('Remember those 90\'s "Under construction" GIFs?<br /> yeah... one of those goes here...'),
    footerButtons: [
        m(Button, {
            label: 'Ugh, ok...',
            events: {
                onclick: () => Dialog.hide(),
            },
        }),
    ],
    backdrop: true,
};


export class Splash extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return [
            m('.splash-background', [
                m('.splash-title-container', [
                    m('.splash-title', 'Jukebox!'),
                    m('.splash-subtitle', 'by Julyee'),
                ]),
                m('.splash-container', [
                    m(List, {
                        border: true,
                        indentedBorder: true,
                        tiles: [
                            m(ListTile, {
                                title: 'Apple Music',
                                subtitle: 'Use your Apple Music Account',
                                hoverable: true,
                                navigation: true,
                                url: {
                                    href: '#!/Home',
                                },
                                front: m(Icon, {
                                    svg: iconApple,
                                    size: 'large',
                                }),
                            }),
                            m(ListTile, {
                                title: 'Jukebox!',
                                subtitle: 'Enter a Jukebox code and start playing tunes!',
                                hoverable: true,
                                navigation: true,
                                events: {
                                    onclick: () => Dialog.show(comingSoonDialog),
                                },
                                front: m(Icon, {
                                    svg: iconJukebox,
                                    size: 'large',
                                }),
                            }),
                        ],
                    }),
                ]),
                m('.splash-donations-container', [
                    m('.splash-donations-left', m(Button, {
                        raised: false,
                        content: [
                            m(Icon, {
                                svg: iconPayPal,
                                size: 'regular',
                                style: {color: '#a0a0a0'},
                            }),
                            'Donate',
                        ],
                    })),
                    m('.splash-donations-right', m(Button, {
                        raised: false,
                        content: [
                            m(Icon, {
                                svg: iconPatreon,
                                size: 'regular',
                                style: {color: '#a0a0a0'},
                            }),
                            'Sponsor',
                        ],
                    })),
                ]),
            ]),
            m(Dialog),
        ];
    }
}
