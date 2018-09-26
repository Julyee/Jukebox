import { IBindable } from '../../core/IBindable';
import { IconButton, Icon, Card } from 'polythene-mithril';
import m from 'mithril';
import {svgPathData as playPathData} from '@fortawesome/free-solid-svg-icons/faPlay';
import {svgPathData as stepForwardPathData} from '@fortawesome/free-solid-svg-icons/faStepForward';
import {svgPathData as stepBackPathData} from '@fortawesome/free-solid-svg-icons/faStepBackward';
import {svgPathData as morePathData} from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import {svgPathData as headphonesPathData} from '@fortawesome/free-solid-svg-icons/faHeadphones';
import {IconCSS, IconButtonCSS} from 'polythene-css';
import {EventCenter} from '../../core/EventCenter';
import {Events} from '../Events';
import {Service} from '../../service/Service';

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

const makeButton = (svg, className) => ({
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
});

const StepBackButton = makeButton(iconStepBack, 'player-step-icon');
const PlayButton = makeButton(iconPlay, 'player-play-icon');
const StepForwardButton = makeButton(iconStepForward, 'player-step-icon');
const MoreButton = makeButton(iconMore, 'player-more-icon');


export class Player extends IBindable {
    constructor(/* vnode */) {
        super();
    }

    oninit(vnode) {
        const service = Service.activeService();
        vnode.state.loadingProgress = service ? service.bufferingProgress : 0;
        vnode.state.timeProgress = service ? service.playbackProgress : 0;
    }

    oncreate(vnode) {
        vnode.state.bufferEvent = EventCenter.on(Events.PLAYER_BUFFER_CHANGE, progress => {
            if (progress !== vnode.state.loadingProgress) {
                vnode.state.loadingProgress = progress;
                m.redraw();
            }
        });

        vnode.state.playbackTimeEvent = EventCenter.on(Events.PLAYER_TIME_CHANGE, (total, current) => {
            const progress = (current / total) * 100;
            if (progress !== vnode.state.timeProgress) {
                vnode.state.timeProgress = progress;
                m.redraw();
            }
        });
    }

    onremove(vnode) {
        if (vnode.state.bufferEvent) {
            EventCenter.off(Events.PLAYER_BUFFER_CHANGE, vnode.state.bufferEvent);
            delete vnode.state.bufferEvent;
        }

        if (vnode.state.playbackTimeEvent) {
            EventCenter.off(Events.PLAYER_TIME_CHANGE, vnode.state.playbackTimeEvent);
            delete vnode.state.playbackTimeEvent;
        }
    }

    view({ state }) {
        return m('.player-container',
            [
                m('.player-progress-container', [
                    m('.player-loading', { style: { width: `${state.loadingProgress}%`} }),
                    m('.player-progress', { style: { width: `${state.timeProgress}%`} }),
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
