import {Icon, List, ListTile, Button, Dialog, IOSSpinner} from 'polythene-mithril';
import {AppleService} from '../../service/apple/AppleService';
import {JukeboxService} from '../../service/jukebox/JukeboxService';
import {IconCSS} from 'polythene-css';
import {makeSVG} from '../utils/makeSVG';
import {WarningDialog} from '../dialogs/WarningDialog';
import {TextInputDialog} from '../dialogs/TextInputDialog';
import m from 'mithril';

import * as appleSVG from '@fortawesome/free-brands-svg-icons/faApple';
import * as paypalSVG from '@fortawesome/free-brands-svg-icons/faPaypal';
import * as patreonSVG from '@fortawesome/free-brands-svg-icons/faPatreon';
import * as jukeboxSVG from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import * as speakerSVG from '@fortawesome/free-solid-svg-icons/faVolumeUp';
import * as warningSVG from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import nextTick from '../../core/nextTick';

const iconApple = makeSVG(appleSVG, 280, 280);
const iconPayPal = makeSVG(paypalSVG, 280, 280);
const iconPatreon = makeSVG(patreonSVG, 280, 280);
const iconJukebox = makeSVG(jukeboxSVG, 280, 280);
const iconSpeaker = makeSVG(speakerSVG, 280, 280);
const warningJukebox = makeSVG(warningSVG, 280, 280);

IconCSS.addStyle('.splash-service-icon', {
    'size_medium': 25,
});

const loadingDialog = text => ({
    body: [
        m('.splash-loading-icon', [
            m(IOSSpinner, {
                permanent: true,
                show: true,
                raised: false,
                singleColor: true,
            }),
        ]),
        m('.splash-loading-text', text),
    ],
    backdrop: true,
    modal: true,
});

function loadScript(url, errorCB = null) {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = url;
    const x = document.getElementsByTagName('head')[0];
    x.appendChild(s);
    s.addEventListener('error', e => {
        if (errorCB) {
            errorCB(e);
        }
    });
}


export class Splash {
    constructor(/* vnode */) {
        // init
    }

    oncreate() {
        if (!window.MusicKit) {
            loadScript('https://js-cdn.music.apple.com/musickit/v1/musickit.js', error => {
                console.log(error); // eslint-disable-line
                window.MusicKit = null;
                m.redraw();
            });
            document.addEventListener('musickitloaded', () => {
                AppleService.instance().init('devtoken.jwt', 'Jukebox by Julyee', '1.0.0').then(() => {
                    m.redraw();
                });
            });
        }

        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        const host = parsedUrl.searchParams.get('h');
        if (host) {
            this.connectToJukeboxServer(host);
        }
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
                        indentedBorder: false,
                        compact: false,
                        padding: 'none',
                        tiles: [
                            m(ListTile, {
                                title: 'Apple Music',
                                subtitle: 'Use your Apple Music Account',
                                hoverable: true,
                                navigation: true,
                                disabled: Boolean(!window.MusicKit),
                                events: {
                                    onclick: () => this.loginWithAppleMusic(),
                                },
                                front: m(Icon, {
                                    svg: iconApple,
                                    size: 'large',
                                }),
                                after: this._getServiceStateIcon(window.MusicKit),
                            }),
                            m(ListTile, {
                                title: 'Jukebox!',
                                subtitle: 'Enter a Jukebox code and start playing tunes!',
                                hoverable: true,
                                navigation: true,
                                events: {
                                    onclick: () => Dialog.show(TextInputDialog.get(
                                        'Connect to a Jukebox!',
                                        'Code',
                                        'Enter the Jukebox code',
                                        value => this.connectToJukeboxServer(value),
                                    )),
                                },
                                front: m(Icon, {
                                    svg: iconJukebox,
                                    size: 'large',
                                }),
                            }),
                            m(ListTile, {
                                title: 'Connect as Speaker',
                                subtitle: 'Use this device as a wireless speaker!',
                                hoverable: true,
                                navigation: true,
                                events: {
                                    onclick: () => Dialog.show(WarningDialog.get(
                                        'Coming Soon...',
                                        'Remember those 90\'s "Under construction" GIFs?<br />yeah... one of those goes here...',
                                        'Ugh, ok...'
                                    )),
                                },
                                front: m(Icon, {
                                    svg: iconSpeaker,
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
                            m.trust('&nbsp;Donate'),
                        ],
                        style: {
                            padding: '5px',
                        },
                    })),
                    m('.splash-donations-right', m(Button, {
                        raised: false,
                        content: [
                            m.trust('Sponsor&nbsp;'),
                            m(Icon, {
                                svg: iconPatreon,
                                size: 'regular',
                                style: {color: '#a0a0a0'},
                            }),
                        ],
                        style: {
                            padding: '5px',
                        },
                    })),
                ]),
            ]),
            m(Dialog),
        ];
    }

    registerJukeboxServer(service) {
        const jukebox = JukeboxService.instance();
        return jukebox.configureAsServer(service);
    }

    connectToJukeboxServer(host) {
        Dialog.show(loadingDialog('Connecting to Jukebox...')).then(() => nextTick(() => {
            const jukebox = JukeboxService.instance();
            jukebox.configureAsClient(host).then(result => {
                Dialog.hide().then(() => nextTick(() => {
                    if (result) {
                        JukeboxService.activeService(jukebox);
                        window.location.href = '#!/Home';
                    } else {
                        Dialog.show(WarningDialog.get(
                            'Error',
                            'Could not connect to the specified server.',
                            'Got it'
                        ));
                    }
                }));
            });
        }));
    }

    loginWithAppleMusic() {
        Dialog.show(loadingDialog('Waiting for login...')).then(() => {
            const service = AppleService.instance();
            service.authorize().then(() => {
                if (service.authorized) {
                    AppleService.activeService(service);
                    this.registerJukeboxServer(service).then(() => {
                        Dialog.hide().then(() => {
                            nextTick(() => {
                                window.location.href = '#!/Home';
                            });
                        });
                    });
                }
            });
        });
    }

    _getServiceStateIcon(service) {
        if (service) {
            return null;
        } else if (service === undefined) {
            return m('.splash-service-status', m(IOSSpinner, {
                permanent: true,
                show: true,
                raised: false,
                singleColor: true,
                size: 'small',
            }));
        }
        return m('.splash-service-status', m(Icon, {
            svg: warningJukebox,
            size: 'medium',
            class: 'splash-service-icon',
        }));
    }
}
