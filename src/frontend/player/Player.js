import { IBindable } from '../../core/IBindable';
import { IconButton, Icon, Card } from 'polythene-mithril';
import m from 'mithril';
import {svgPathData as playPathData} from '@fortawesome/free-solid-svg-icons/faPlay';
import {svgPathData as stepForwardPathData} from '@fortawesome/free-solid-svg-icons/faStepForward';
import {svgPathData as stepBackPathData} from '@fortawesome/free-solid-svg-icons/faStepBackward';
import {svgPathData as morePathData} from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import {svgPathData as headphonesPathData} from '@fortawesome/free-solid-svg-icons/faHeadphones';
import {IconCSS, IconButtonCSS} from 'polythene-css';

IconButtonCSS.addStyle('.player-button', {
    padding: 2,
});

IconCSS.addStyle('.player-play-icon', {
    'size_large': 45,
});

IconCSS.addStyle('.player-step-icon', {
    'size_large': 35,
});

IconCSS.addStyle('.player-more-icon', {
    'size_large': 25,
});

IconCSS.addStyle('.player-headphones-icon', {
    'size_large': 45,
});

const iconStepBack = m.trust(`<svg width="280" height="280" viewBox="-70 -40 600 600"><path d="${stepBackPathData}"/></svg>`);
const iconPlay = m.trust(`<svg width="280" height="280" viewBox="-120 -40 600 600"><path d="${playPathData}"/></svg>`);
const iconStepForward = m.trust(`<svg width="280" height="280" viewBox="-70 -40 600 600"><path d="${stepForwardPathData}"/></svg>`);
const iconMore = m.trust(`<svg width="280" height="280" viewBox="-70 -40 600 600"><path d="${morePathData}"/></svg>`);
const iconHeadphones = m.trust(`<svg width="280" height="280" viewBox="-40 -40 600 600"><path d="${headphonesPathData}"/></svg>`);

const makeButton = (svg, className) => {
    return {
        view: () =>
            m('.player-controls-button', [
                m(IconButton, {
                    inactive: false,
                    className: 'player-button',
                }, [
                    m(Icon, {
                        svg: svg,
                        size: 'large',
                        className: className,
                    }),
                ]),
            ]),
    };
};

const StepBackButton = makeButton(iconStepBack, 'player-step-icon');
const PlayButton = makeButton(iconPlay, 'player-play-icon');
const StepForwardButton = makeButton(iconStepForward, 'player-step-icon');
const MoreButton = makeButton(iconMore, 'player-more-icon');


export class Player extends IBindable {
    constructor(/* vnode */) {
        super();
        // init
    }

    view() {
        return m('.player-container',
            [
                m('.player-progress-container', [
                    m('.player-progress'),
                ]),
                m('.player-controls-container', [
                    m(Card, {
                        content: [
                            {
                                header: {
                                    title: 'Song Name',
                                    subtitle: 'Artist Name',
                                    icon: {
                                        svg: iconHeadphones,
                                        size: 'large',
                                        className: 'player-headphones-icon',
                                    },
                                },
                            },
                            // {
                            //     primary: {
                            //         title: 'Song Name',
                            //         subtitle: 'Artist Name',
                            //     },
                            // },
                        ],
                        style: {
                            'flex-grow': 0.91,
                        },
                        shadowDepth: 0,
                    }),
                    m(StepBackButton),
                    m(PlayButton),
                    m(StepForwardButton),
                    m(MoreButton),
                ]),
            ],
        );
    }
}
