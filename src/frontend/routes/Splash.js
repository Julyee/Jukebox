import {Icon, List, ListTile, Button, Dialog, IOSSpinner} from 'polythene-mithril';
import {AppleService} from '../../service/apple/AppleService';
import {JukeboxService} from '../../service/jukebox/JukeboxService';
import {IconCSS} from 'polythene-css';
import {makeSVG} from '../utils/makeSVG';
import {WarningDialog} from '../dialogs/WarningDialog';
import {JukeboxConnectDialog} from '../dialogs/JukeboxConnectDialog';
import m from 'mithril';

import * as appleSVG from '@fortawesome/free-brands-svg-icons/faApple';
import * as paypalSVG from '@fortawesome/free-brands-svg-icons/faPaypal';
import * as patreonSVG from '@fortawesome/free-brands-svg-icons/faPatreon';
import * as jukeboxSVG from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import * as speakerSVG from '@fortawesome/free-solid-svg-icons/faVolumeUp';
import * as warningSVG from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import nextTick from '../../core/nextTick';
import {Service} from '../../service/Service';

const iconApple = makeSVG(appleSVG, 280, 280);
const iconPayPal = makeSVG(paypalSVG, 280, 280);
const iconPatreon = makeSVG(patreonSVG, 280, 280);
const iconJukebox = makeSVG(jukeboxSVG, 280, 280);
const iconSpeaker = makeSVG(speakerSVG, 280, 280);
const warningJukebox = makeSVG(warningSVG, 280, 280);

IconCSS.addStyle('.splash-service-icon', {
    'size_medium': 25,
});

const loadingDialog = ({text, didShow, didHide}) => ({
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
    didShow: didShow ? didShow : null,
    didHide: didHide ? didHide : null,
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
                AppleService.instance().init('keys/devtoken.jwt', 'Jukebox by Julyee', '1.0.0').then(() => {
                    m.redraw();
                }).catch(reason => {
                    console.error(reason); // eslint-disable-line
                    window.MusicKit = null;
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
        if (Service.allConfigured()) {
            setTimeout(() => {
                const route = Service.activeService().isSpeaker ? '/Speaker' : '/Home';
                m.route.set(route, null, { replace: true });
            });
        }

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
                                    onclick: () => Dialog.show(JukeboxConnectDialog.get(
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
                                title: 'Speaker',
                                subtitle: 'Use this device as a wireless speaker!',
                                hoverable: true,
                                navigation: true,
                                events: {
                                    onclick: () => Dialog.show(JukeboxConnectDialog.get(
                                        'Connect as a Speaker!',
                                        'Code',
                                        'Enter the Jukebox code',
                                        value => this.connectToJukeboxServerAsSpeaker(value),
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
        Dialog.show(loadingDialog({
            text: 'Connecting to Jukebox...',
            didShow: () => {
                const jukebox = JukeboxService.instance();
                jukebox.configureAsClient(host).then(result => {
                    if (result) {
                        Service.activeService(jukebox);
                    }
                    Dialog.hide();
                });
            },
            didHide: () => {
                nextTick(() => {
                    const service = JukeboxService.instance();
                    if (service.authorized) {
                        Service.allConfigured(true);
                        m.redraw();
                    } else {
                        Dialog.show(WarningDialog.get(
                            'Error',
                            'Could not connect to the specified server.',
                            'Got it'
                        ));
                    }
                });
            },
        }));
    }

    connectToJukeboxServerAsSpeaker(host) {
        Dialog.show(loadingDialog({
            text: 'Connecting to Jukebox...',
            didShow: () => {
                const jukebox = JukeboxService.instance();
                jukebox.configureAsSpeaker(host).then(result => {
                    if (result) {
                        Service.activeService(jukebox);
                    }
                    Dialog.hide();
                });
            },
            didHide: () => {
                nextTick(() => {
                    const service = JukeboxService.instance();
                    if (service.authorized) {
                        Service.allConfigured(true);
                        m.redraw();
                    } else {
                        Dialog.show(WarningDialog.get(
                            'Error',
                            'Could not connect to the specified server.',
                            'Got it'
                        ));
                    }
                });
            },
        }));
    }

    loginWithAppleMusic() {
        const service = AppleService.instance();
        service.authorize().then(() => {
            if (service.authorized) {
                this.registerJukeboxServer(service).then(result => {
                    if (result) {
                        Service.activeService(service);
                    }
                    Dialog.hide();
                });
            } else {
                Dialog.hide();
            }
        }).catch(reason => {
            console.error(reason); // eslint-disable-line
            Dialog.hide();
        });

        Dialog.show(loadingDialog({
            text: 'Waiting for login...',
            didHide: () => {
                nextTick(() => {
                    if (service.authorized) {
                        Service.allConfigured(true);
                        m.redraw();
                    } else {
                        Dialog.show(WarningDialog.get(
                            'Error',
                            'Could not connect to Apple Music.',
                            'Got it'
                        ));
                    }
                });
            },
        }));

        // const service = AppleService.instance();
        // service.authorize().then(() => {
        //     if (service.authorized) {
        //         AppleService.activeService(service);
        //         m.route.set('/Home', null, { replace: true });
        //     }
        // });
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
