import {TextField, Button, Dialog, IconButton} from 'polythene-mithril';
import {QRScanner} from '../components/QRScanner';
import stream from 'mithril/stream';
import m from 'mithril';
import nextTick from '../../core/nextTick';
import * as cameraSGV from '@fortawesome/free-solid-svg-icons/faCamera';
import {makeSVG} from '../utils/makeSVG';

const iconCamera = makeSVG(cameraSGV, 280, 280);

export const JukeboxConnectDialog = {
    get: function getDialog(title, label, help = null, onSubmit = null) {
        const value = stream('');
        const showCam = stream(false);
        const submit = code => {
            Dialog.hide().then(() => {
                nextTick(() => {
                    if (onSubmit) {
                        onSubmit(code);
                    }
                });
            });
        };

        let detected = false;
        const createForm = () => {
            const form = [];

            if (showCam()) {
                form.push(m(QRScanner, {
                    onCode: code => {
                        if (!detected) {
                            if (code.indexOf('#!/Splash') !== -1) {
                                const parts = code.split('#!/Splash');
                                if (parts[1][0] === '?' && parts[1][1] === 'h' && parts[1][2] === '=') {
                                    detected = true;
                                    value(parts[1].substring(3));
                                    m.redraw();
                                    nextTick(() => submit(value()));
                                }
                            }
                        }
                    },
                }));
            }

            form.push(m(TextField, {
                floatingLabel: true,
                label: label,
                help: help,
                focusHelp: true,
                required: true,
                value: value,
                events: {
                    oninput: e => {
                        value(e.target.value);
                    },
                },
            }));

            form.push(m('.dialog-text-input-buttons-container', [
                m('.dialog-jukebox-camera-button', m(IconButton, {
                    icon: {
                        svg: iconCamera,
                        // size: 'small',
                    },
                    raised: true,
                    events: {
                        onclick: () => {
                            detected = false;
                            showCam(!showCam());
                            m.redraw();
                        },
                    },
                })),
                m('.dialog-text-input-button', m(Button, {
                    label: 'Cancel',
                    raised: true,
                    events: {
                        onclick: () => {
                            Dialog.hide();
                        },
                    },
                })),
                m('.dialog-text-input-button', m(Button, {
                    element: 'button',
                    type: 'submit',
                    label: 'Submit',
                    raised: true,
                    disabled: value() === '',
                })),
            ]));

            return form;
        };

        return () => ({
            modal: true,
            backdrop: true,
            title: title,
            body: m('.dialog-text-input-container', m('form', {
                onsubmit: async e => {
                    e.preventDefault();
                    submit(value());
                },
            }, createForm())),
        });
    },
};
