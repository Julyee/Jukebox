import {TextField, Button, Dialog} from 'polythene-mithril';
import stream from 'mithril/stream';
import m from 'mithril';
import nextTick from '../../core/nextTick';

export const TextInputDialog = {
    get: function getDialog(title, label, help = null, onSubmit = null) {
        const value = stream('');

        const createForm = () => {
            const form = [];

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
                    Dialog.hide().then(() => {
                        nextTick(() => {
                            if (onSubmit) {
                                onSubmit(value());
                            }
                        });
                    });
                },
            }, createForm())),
        });
    },
};
