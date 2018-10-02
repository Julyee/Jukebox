import { IBindable } from '../../core/IBindable';
import { IconButton, Icon } from 'polythene-mithril';
import m from 'mithril';
import * as playSVG from '@fortawesome/free-solid-svg-icons/faPlay';
import * as pauseSVG from '@fortawesome/free-solid-svg-icons/faPause';
import * as stepForwardSVG from '@fortawesome/free-solid-svg-icons/faStepForward';
import * as stepBackSVG from '@fortawesome/free-solid-svg-icons/faStepBackward';
import * as moreSVG from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import * as headphonesSVG from '@fortawesome/free-solid-svg-icons/faHeadphones';
import {IconCSS, IconButtonCSS} from 'polythene-css';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events, PlaybackStateEvents} from '../Events';
import {Service} from '../../service/Service';

IconButtonCSS.addStyle('.player-button', {
    padding: 2,
});

IconCSS.addStyle('.player-play-icon', {
    'size_large': 35,
});

IconCSS.addStyle('.player-step-icon', {
    'size_large': 25,
});

IconCSS.addStyle('.player-more-icon', {
    'size_large': 15,
});

const makeSVG = (iconDesc, width, height) => m.trust(`<svg width="${width}" height="${height}" viewBox="0 0 ${iconDesc.width} ${iconDesc.height}"><path d="${iconDesc.svgPathData}"/></svg>`);

const iconStepBack = makeSVG(stepBackSVG, 35, 35);
const iconPlay = makeSVG(playSVG, 45, 45);
const iconPuase = makeSVG(pauseSVG, 45, 45);
const iconStepForward = makeSVG(stepForwardSVG, 35, 35);
const iconMore = makeSVG(moreSVG, 35, 35);

const makeButton = (svg, className, kind) => ({
    view: () =>
        m('.player-controls-button', [
            m(IconButton, {
                inactive: false,
                className: 'player-button',
                events: {
                    onclick: () => EventCenter.emit(Events.BUTTON_PRESS, kind),
                },
            }, [
                m(Icon, {
                    svg: svg,
                    size: 'large',
                    className: className,
                }),
            ]),
        ]),
});

const StepBackButton = makeButton(iconStepBack, 'player-step-icon', Buttons.PLAYER_PREVIOUS_BUTTON);
const PlayButton = makeButton(iconPlay, 'player-play-icon', Buttons.PLAYER_PLAY_BUTTON);
const PauseButton = makeButton(iconPuase, 'player-play-icon', Buttons.PLAYER_PAUSE_BUTTON);
const StepForwardButton = makeButton(iconStepForward, 'player-step-icon', Buttons.PLAYER_NEXT_BUTTON);
const MoreButton = makeButton(iconMore, 'player-more-icon', Buttons.PLAYER_MORE_BUTTON);

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
        const progressCanvas = vnode.dom.getElementsByClassName('player-progress')[0];
        progressCanvas.width = progressCanvas.offsetWidth * window.devicePixelRatio;
        progressCanvas.height = progressCanvas.offsetHeight * window.devicePixelRatio;
        vnode.state.progressContext = progressCanvas.getContext('2d');
        this._renderProgress(vnode.state.progressContext, 0, 0);

        vnode.state.bufferEvent = EventCenter.on(Events.PLAYER_BUFFER_CHANGE, progress => {
            if (progress !== vnode.state.loadingProgress) {
                vnode.state.loadingProgress = progress;
                this._renderProgress(vnode.state.progressContext, progress, vnode.state.timeProgress);
            }
        });

        vnode.state.playbackTimeEvent = EventCenter.on(Events.PLAYER_TIME_CHANGE, () => {
            const progress = Service.activeService().playbackProgress;
            if (progress !== vnode.state.timeProgress) {
                vnode.state.timeProgress = progress;
                this._renderProgress(vnode.state.progressContext, vnode.state.loadingProgress, progress);
            }
        });

        vnode.state.playStateChangeEvent = EventCenter.on(Object.values(PlaybackStateEvents), () => m.redraw());
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

        if (vnode.state.playStateChangeEvent) {
            EventCenter.off(Object.values(PlaybackStateEvents), vnode.state.playStateChangeEvent);
            delete vnode.state.playStateChangeEvent;
        }
    }

    view() {
        const service = Service.activeService();
        const song = service ? service.currentSong : null;
        const artworkURL = song ? song.formatArtworkURL(40, 40) : null;
        return m('.player-container',
            [
                m('.player-progress-container', [
                    m('canvas', { class: 'player-progress' }),
                ]),
                m('.player-view-container', [
                    m('.player-icon-container', [
                        m('.player-icon', song ? {
                            style: {
                                'background-image': `url(${artworkURL})`,
                            },
                        } : {}, [
                            !song ? makeSVG(headphonesSVG, 40, 40) : null,
                        ]),
                    ]),
                    m('.player-info-container', [
                        m('.player-info', [
                            m('.player-song-name', song ? song.name : 'Not Playing'),
                            song && song.isExplicit ? m('.player-song-explicit', '🅴') : null,
                            song ? m('.search-result-song-artist', song.artist) : null,
                            song ? m('.search-result-song-album', song.album) : null,
                        ]),
                    ]),
                    m('.player-controls-container', [
                        m('.player-controls', [
                            m(StepBackButton),
                            m(service && service.isPlaying ? PauseButton : PlayButton),
                            m(StepForwardButton),
                            m(MoreButton),
                        ]),
                    ]),
                ]),
            ],
        );
    }

    _renderProgress(ctx, bufferProgress, playbackProgress) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width * bufferProgress * 0.01, height);

        ctx.fillStyle = 'rgba(31,200,219,0.5)';
        ctx.fillRect(0, 0, width * playbackProgress * 0.01, height);
    }
}
