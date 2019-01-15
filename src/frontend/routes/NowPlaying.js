import m from 'mithril';
import {Layout} from '../Layout';
import {List, ListTile} from 'polythene-mithril';
import {SongItem} from '../components/SongItem';
import {MediaManager} from '../../service/MediaManager';
import {Buttons} from '../Events';

export class NowPlaying extends Layout {
    constructor(/* vnode */) {
        super();
        this.mCurrentSong = null;
        this.mLyrics = null;
    }

    oncreate(vnode) {
        super.oncreate(vnode);
        vnode.state.animation = requestAnimationFrame(() => this._computeLyricsLines(vnode));
    }

    onremove(vnode) {
        if (vnode.state.animation) {
            cancelAnimationFrame(vnode.state.animation);
            vnode.state.animation = null;
        }
    }

    content() {
        const currentSong = MediaManager.currentSong;
        if (currentSong !== this.mCurrentSong) {
            this.mCurrentSong = currentSong;
            this.mLyrics = null;
            if (this.mCurrentSong) {
                MediaManager.queue.lyricsForSong(currentSong).then(lyrics => {
                    if (lyrics && this.mCurrentSong === currentSong) {
                        this.mLyrics = [];
                        lyrics.forEach(line => {
                            this.mLyrics.push(Object.assign({}, line, {
                                enabled: false,
                                positionY: 0,
                                alpha: 0,
                                translateY: -50,
                            }));
                        });
                        if (this.mLyrics.length) {
                            const i = this.mLyrics.length - 1;
                            this.mLyrics[i].end = currentSong.duration;
                            this.mLyrics[i].duration = currentSong.duration - this.mLyrics[i].start;
                        }
                        m.redraw();
                    }
                });
            }
        }

        const date = currentSong && currentSong.releaseDate ? new Date(currentSong.releaseDate) : null;
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const hasLyrics = Boolean(this.mCurrentSong && this.mLyrics);
        const thumbnailSize = hasLyrics ? 100 : 350;
        const classSuffix = hasLyrics ? '-small' : '';


        const artwork = m('.now-playing-artwork' + classSuffix, currentSong ? {
            style: {
                'background-image': `url(${currentSong.formatArtworkURL(thumbnailSize, thumbnailSize)})`,
            },
        } : null);

        const info = currentSong ? m('.now-playing-song-info-container' + classSuffix, [
            currentSong.title ? m('.now-playing-song-title' + classSuffix, currentSong.title) : null,
            currentSong.isExplicit ? m('.now-playing-song-explicit' + classSuffix, '🅴') : null,
            currentSong.subtitle ? m('.now-playing-song-subtitle' + classSuffix, currentSong.subtitle) : null,
            date ? m('.now-playing-song-date' + classSuffix, date.toLocaleDateString('en-US', dateOptions)) : null,
            currentSong.genres ? m('.now-playing-song-genre' + classSuffix, currentSong.genres.join(', ')) : null,
            currentSong.formattedDuration ? m('.now-playing-song-duration' + classSuffix, currentSong.formattedDuration) : null,
        ]) : m('.now-playing-song-info-container' + classSuffix, m('.now-playing-list-title', 'Not Playing'));

        const songs = [];
        songs.push(...MediaManager.queue.queue);
        if (MediaManager.queue.recommendationsQueue.length) {
            songs.push({ separator: true, label: 'To keep going:'});
            for (let i = 0; i < 2 && i < MediaManager.queue.recommendationsQueue.length; ++i) {
                songs.push(MediaManager.queue.recommendationsQueue[i]);
            }
        }

        const lyricsLines = [];
        if (hasLyrics) {
            this.mLyrics.forEach(line => {
                if (line.enabled) {
                    lyricsLines.push(m('.now-playing-lyrics-line', {
                        style: `top:${line.positionY}%; color:rgba(0,0,0,${line.alpha}); transform: translate(-50%, ${line.translateY}%);`,
                    }, line.text));
                }
            });
        }

        return m('.now-playing-container', [
            m('.now-playing-song-container' + classSuffix, hasLyrics ? [
                m('div', [ artwork, info ]),
                m('.now-playing-lyrics-container', lyricsLines),
            ] : [
                artwork,
                info,
            ]),
            m('.now-playing-list-container', [
                m('.now-playing-list-title', 'Up Next'),
                songs.length ? m(List, {
                    border: true,
                    indentedBorder: false,
                    compact: false,
                    padding: 'none',
                    tiles: songs.map(item => {
                        if (item.separator) {
                            return m(ListTile, {
                                class: 'now-playing-list-separator',
                                content: item.label,
                            });
                        }

                        return m(SongItem, {
                            song: item.song,
                            size: 52,
                            clickable: false,
                            faded: item.isRecommendation,
                            displayThumbnail: true,
                            songMenuItems: [
                                { title: 'Add to a Playlist...', event: Buttons.SONG_ADD_TO_PLAYLIST },
                                { title: 'Create Station', event: Buttons.SONG_CREATE_STATION },
                            ],
                        });
                    }),
                }) : null,
            ]),
        ]);
    }

    _computeLyricsLines(vnode) {
        if (this.mLyrics && this.mCurrentSong && this.mLyrics.length) {
            const time = this.mCurrentSong.service.playbackTime * 1000;
            let index = -1;
            let timeLeft = 0;
            let duration = 0;
            for (let i = 0, n = this.mLyrics.length; i < n; ++i) {
                this.mLyrics[i].enabled = false;
                this.mLyrics[i].positionY = 0;
                this.mLyrics[i].alpha = 0;
                this.mLyrics[i].translateY = 0;
                if (time >= this.mLyrics[i].start && time <= this.mLyrics[i].end) {
                    index = i;
                    duration = this.mLyrics[i].duration;
                    timeLeft = duration - (time - this.mLyrics[i].start);
                }
            }

            if (index === -1) {
                if (time > this.mLyrics[this.mLyrics.length - 1].end) {
                    index = this.mLyrics[this.mLyrics.length - 1].end;
                    duration = this.mCurrentSong.duration - this.mLyrics[this.mLyrics.length - 1].end;
                    timeLeft = this.mCurrentSong.duration - time;
                } else {
                    duration = this.mLyrics[0].start;
                    timeLeft = duration - time;
                }
            }
            const progress = timeLeft / duration;
            const easedInProgress = this._easeIn(progress);
            const easedOutProgress = this._easeOut(progress);
            if (index - 1 >= 0 && index - 1 < this.mLyrics.length) {
                this.mLyrics[index - 1].enabled = true;
                this.mLyrics[index - 1].positionY = (0.5 - 0.25 * (1.0 - easedInProgress)) * 100;
                this.mLyrics[index - 1].translateY = -100;
                this.mLyrics[index - 1].alpha = 0.8 * easedInProgress;
            }

            if (index >= 0 && index < this.mLyrics.length) {
                this.mLyrics[index].enabled = true;
                this.mLyrics[index].positionY = 50;
                this.mLyrics[index].translateY = (1.0 - progress) * -100;
                this.mLyrics[index].alpha = 0.8;
            }

            if (index + 1 >= 0 && index + 1 < this.mLyrics.length) {
                this.mLyrics[index + 1].enabled = true;
                this.mLyrics[index + 1].positionY = (0.5 + 0.25 * easedOutProgress) * 100;
                this.mLyrics[index + 1].translateY = 0;
                this.mLyrics[index + 1].alpha = 0.8 * (1.0 - easedOutProgress);
            }

            m.redraw();
        }

        if (vnode.state.animation) {
            vnode.state.animation = requestAnimationFrame(() => this._computeLyricsLines(vnode));
        }
    }

    _easeIn(value) {
        return Math.pow(value, 5);
    }

    _easeOut(value) {
        const t = value - 1.0;
        return (t * t * t * t * t + 1);
    }
}
