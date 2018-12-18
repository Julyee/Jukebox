import m from 'mithril';
import {Button} from 'polythene-mithril';
import {Service} from '../../service/Service';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, GeneralEvents} from '../Events';
import {MediaManager} from '../../service/MediaManager';

export class Speaker {
    oninit() {
        if (!(Service.activeService() instanceof Service) || !Service.activeService().isSpeaker) {
            m.route.set('/Splash');
        }
    }

    view() {
        if (!Service.activeService() || !Service.activeService().isSpeakerPlaying) {
            return m('.speaker-message-container', [
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
            ]);
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

        return m('.now-playing-song-container', [
            // artwork,
            info,
        ]);
    }
}
