import m from 'mithril';
import {Button} from 'polythene-mithril';
import {Service} from '../../service/Service';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents} from '../Events';
import {MediaManager} from '../../service/MediaManager';
import * as tickUpSVG from '@fortawesome/free-solid-svg-icons/faCaretSquareUp';
import * as tickDownSVG from '@fortawesome/free-solid-svg-icons/faCaretSquareDown';
import {makeSVG} from '../utils/makeSVG';

const tickUpIcon = makeSVG(tickUpSVG, 24, 24);
const tickDownIcon = makeSVG(tickDownSVG, 24, 24);


export class Speaker {
    oninit(vnode) {
        if (!(Service.activeService() instanceof Service) || !Service.activeService().isSpeaker) {
            m.route.set('/Splash');
        }

        vnode.state.visualization = {};
    }

    // oncreate(vnode) {
    //     const canvas = document.getElementById('speaker-visualization-canvas');
    //     if (canvas) {
    //         // const analyser = Service.activeService().audioAnalyser;
    //
    //         canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    //         canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    //
    //         vnode.state.visualization.canvas = canvas;
    //         vnode.state.visualization.context = canvas.getContext('2d');
    //         // vnode.state.visualization.analyser = analyser;
    //         // vnode.state.visualization.bufferLength = analyser.frequencyBinCount;
    //         // vnode.state.visualization.buffer = new Uint8Array(vnode.state.visualization.bufferLength);
    //
    //         this._renderLoop(vnode);
    //     }
    // }

    onupdate(vnode) {
        const canvas = document.getElementById('speaker-visualization-canvas');
        if (canvas && vnode.state.visualization.canvas !== canvas) {
            if (vnode.state.visualization.animation) {
                cancelAnimationFrame(vnode.state.visualization.animation);
            }

            const analyser = Service.activeService().audioAnalyser;

            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            vnode.state.visualization.canvas = canvas;
            vnode.state.visualization.context = canvas.getContext('2d');
            vnode.state.visualization.gain = Service.activeService().audioGain;
            vnode.state.visualization.delay = Service.activeService().audioDelay;
            vnode.state.visualization.analyser = analyser;
            vnode.state.visualization.bufferLength = analyser.frequencyBinCount;
            vnode.state.visualization.buffer = new Uint8Array(vnode.state.visualization.bufferLength);
            vnode.state.visualization.sampleRate = Service.activeService().audioContext.sampleRate;

            this._renderLoop(vnode);
        }
    }

    onremove(vnode) {
        if (vnode.state.visualization.animation) {
            cancelAnimationFrame(vnode.state.visualization.animation);
        }
        vnode.state.visualization = null;
    }

    view(vnode) {
        if (!Service.activeService() || !Service.activeService().isSpeakerPlaying) {
            return [
                m('.speaker-message-container', [
                    m('.speaker-message-title', 'Speaker'),
                    m('.speaker-message-content', 'This device is ready to be used as a speaker, please make sure to adjust the delay and that your device is not muted.'),
                    m('.speaker-start-button', m(Button, {
                        raised: true,
                        label: 'START',
                        events: {
                            onclick: () => {
                                EventCenter.emit(GeneralEvents.BUTTON_PRESS, Buttons.SPEAKER_START_STREAMING, this);
                                m.redraw();
                            },
                        },
                    })),
                ]),
            ];
        }

        const currentSong = MediaManager.currentSong;
        const date = currentSong && currentSong.releaseDate ? new Date(currentSong.releaseDate) : null;
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        const info = currentSong ? m('.now-playing-song-info-container', [
            currentSong.isExplicit ? m('.song-list-view-explicit', '🅴') : null,
            currentSong.title ? m('.song-list-view-title', currentSong.title) : null,
            currentSong.subtitle ? m('.song-list-view-subtitle', currentSong.subtitle) : null,
            date ? m('.song-list-view-date', date.toLocaleDateString('en-US', dateOptions)) : null,
            currentSong.genres ? m('.song-list-view-genre', currentSong.genres.join(', ')) : null,
            currentSong.formattedDuration ? m('.song-list-view-duration', currentSong.formattedDuration) : null,
        ]) : m('.now-playing-song-info-container', m('.now-playing-list-title', 'Not Playing'));

        return [
            m('.speaker-content-container', [
                m('.speaker-visualization-controls-container', [
                    m('.speaker-visualization-canvas-container', m('canvas', { class: 'speaker-visualization-canvas', id: 'speaker-visualization-canvas' })),
                    m('.speaker-controls-container', [
                        m('.speaker-control-container', vnode.state.visualization.gain ? this._volumeControl(vnode) : null),
                        m('.speaker-control-container', vnode.state.visualization.delay ? this._delayControl(vnode) : null),
                    ]),
                ]),
                m('.speaker-song-info-container', info),
            ]),
        ];
    }

    _volumeControl(vnode) {
        const result = [];
        const gain = vnode.state.visualization.gain.gain;

        result.push(m('.speaker-control-button', {
            onclick: e => {
                e.preventDefault();
                gain.value = Math.min(1.0, Math.fround(gain.value + 0.02));
            },
        }, tickUpIcon));

        result.push(...this._tickBar(gain.value));

        result.push(m('.speaker-control-button', {
            onclick: e => {
                e.preventDefault();
                gain.value = Math.max(0, Math.fround(gain.value - 0.02));
            },
        }, tickDownIcon));

        result.push(m('.speaker-control-label', 'VOLUME'));

        return result;
    }

    _delayControl(vnode) {
        const result = [];
        const delay = vnode.state.visualization.delay.delayTime;

        result.push(m('.speaker-control-button', {
            onclick: e => {
                e.preventDefault();
                delay.value = Math.min(1.0, Math.fround(delay.value + 0.02));
            },
        }, tickUpIcon));

        result.push(...this._tickBar(delay.value));

        result.push(m('.speaker-control-button', {
            onclick: e => {
                e.preventDefault();
                delay.value = Math.max(0, Math.fround(delay.value - 0.02));
            },
        }, tickDownIcon));

        result.push(m('.speaker-control-label', 'DELAY'));

        return result;
    }

    _tickBar(value) {
        const result = [];
        for (let i = 0; i < 20; i++) {
            if (value >= 0.05 * (20 - i)) {
                result.push(m('.speaker-control-tick', { style: 'background-color: rgba(0, 0, 0, 0.7);'}));
            } else if (value > 0.05 * (19 - i)) {
                const over = value - (0.05 * (19 - i));
                const alpha = 0.7 * (over / 0.05);
                result.push(m('.speaker-control-tick', {
                    style: `border: 1px solid rgba(0, 0, 0, 0.7); background-color: rgba(0, 0, 0, ${alpha});`,
                }));
            } else {
                result.push(m('.speaker-control-tick'));
            }
        }
        return result;
    }

    _renderLoop(vnode) {
        if (vnode.state.visualization) {
            vnode.state.visualization.animation = requestAnimationFrame(() => this._renderLoop(vnode));
        }

        this._drawSpeaker(vnode, vnode.state.visualization.canvas.width);
    }

    _drawSpeaker(vnode, size) {
        const visualization = vnode.state.visualization;
        const canvas = visualization.canvas;
        const context = visualization.context;
        const buffer = visualization.buffer;
        const bufferLength = visualization.bufferLength;
        const hzPerBin = (visualization.sampleRate * 0.5) / bufferLength;
        vnode.state.visualization.analyser.getByteFrequencyData(buffer);

        const bassStart = 0;
        const bassEnd = Math.ceil(120 / hzPerBin);

        const midStart = bassEnd + 1;
        const midEnd = Math.ceil(600 / hzPerBin);

        const highStart = midEnd + 1;
        const highEnd = bufferLength; // Math.ceil(200/ hzPerBin);

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.rect(0.2 * size, 0.025 * size, 0.6 * size, 0.95 * size);
        context.closePath();

        // cabinet
        this._drawCircle(context,
            0.25 * size,
            0.075 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.75 * size,
            0.075 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.25 * size,
            0.925 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.75 * size,
            0.925 * size,
            0.01 * size,
            true);
        context.closePath();

        this._drawCircle(context,
            0.675 * size,
            0.875 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.325 * size,
            0.525 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.675 * size,
            0.525 * size,
            0.01 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.325 * size,
            0.875 * size,
            0.01 * size,
            true);
        context.closePath();

        this._drawCircle(context,
            0.4 * size,
            0.1 * size,
            0.0075 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.4 * size,
            0.3 * size,
            0.0075 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.6 * size,
            0.1 * size,
            0.0075 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.6 * size,
            0.3 * size,
            0.0075 * size,
            true);
        context.closePath();

        this._drawCircle(context,
            0.35 * size,
            0.4375 * size,
            0.005 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.25 * size,
            0.3375 * size,
            0.005 * size,
            true);
        context.closePath();

        this._drawCircle(context,
            0.65 * size,
            0.4375 * size,
            0.005 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.75 * size,
            0.3375 * size,
            0.005 * size,
            true);
        context.closePath();

        // speakers
        this._drawCircle(context,
            0.5 * size,
            0.7 * size,
            0.2 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.5 * size,
            0.7 * size,
            this._radiusFromSpectrum(buffer, bassStart, bassEnd, 0.1625 * size, 0.19 * size),
            false);
        context.closePath();
        this._drawCircle(context,
            0.5 * size,
            0.7 * size,
            this._radiusFromSpectrum(buffer, bassStart, bassEnd, 0.05 * size, 0.075 * size),
            true);
        context.closePath();

        this._drawCircle(context,
            0.5 * size,
            0.2 * size,
            0.1125 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.5 * size,
            0.2 * size,
            this._radiusFromSpectrum(buffer, midStart, midEnd, 0.0875 * size, 0.1025 * size),
            false);
        context.closePath();
        this._drawCircle(context,
            0.5 * size,
            0.2 * size,
            this._radiusFromSpectrum(buffer, midStart, midEnd, 0.025 * size, 0.05 * size),
            true);
        context.closePath();

        this._drawCircle(context,
            0.3 * size,
            0.3875 * size,
            0.05 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.3 * size,
            0.3875 * size,
            this._radiusFromSpectrum(buffer, highStart, highEnd, 0.03 * size, 0.0475 * size, this._easeInQuad),
            false);
        context.closePath();

        this._drawCircle(context,
            0.7 * size,
            0.3875 * size,
            0.05 * size,
            true);
        context.closePath();
        this._drawCircle(context,
            0.7 * size,
            0.3875 * size,
            this._radiusFromSpectrum(buffer, highStart, highEnd, 0.03 * size, 0.0475 * size, this._easeInQuad),
            true);
        context.closePath();

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fill();
    }

    _drawCircle(context, x, y, radius, anticlockwise = false) {
        context.arc(x, y, radius, 0, 2 * Math.PI, anticlockwise);
    }

    _radiusFromSpectrum(spectrum, start, end, min, max, easeFunc = this._easeIn) {
        let value = 0;
        let count = 0;

        for (let i = start; i < end; ++i) {
            if (spectrum[i] !== -Infinity && spectrum[i] > 32) {
                count += 1;
                value += spectrum[i];
            }
        }

        if (count) {
            value /= count;
            value = easeFunc(value / 255);
        }

        return min + ((max - min) * value);
    }

    _easeIn(value) {
        return Math.pow(value, 5);
    }

    _easeInQuad(value) {
        return value * value;
    }
}
