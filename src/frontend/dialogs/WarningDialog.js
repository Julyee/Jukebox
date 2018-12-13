import m from 'mithril';
import {Button, Dialog, Icon} from 'polythene-mithril';
import {makeSVG} from '../utils/makeSVG';
import * as warningSVG from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';

const warningJukebox = makeSVG(warningSVG, 280, 280);

export const WarningDialog = {
    get: function getDialog(title, content, buttonLabel) {
        return {
            title: [
                m(Icon, {
                    svg: warningJukebox,
                    size: 'large',
                }),
                ` ${title}`,
            ],
            body: m.trust(content),
            footerButtons: [
                m(Button, {
                    label: buttonLabel,
                    events: {
                        onclick: () => Dialog.hide(),
                    },
                }),
            ],
            backdrop: true,
        };
    },
};
