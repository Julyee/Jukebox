import m from 'mithril';
import {Button} from 'polythene-mithril';
import {Service} from '../../service/Service';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents} from '../Events';
import {MediaManager} from '../../service/MediaManager';

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

    view() {
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
            m('.now-playing-song-container', [
                // artwork,
                info,
            ]),
            m('canvas', { class: 'speaker-visualization-canvas', id: 'speaker-visualization-canvas' }),
        ];
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
