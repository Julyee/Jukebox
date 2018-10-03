import m from 'mithril';
import {Card} from 'polythene-mithril';
import {EventCenter} from '../../core/EventCenter';
import {Buttons, Events} from '../Events';

export class VideoCard {
    view(vnode) {
        return this._getContent(vnode.attrs.video, vnode.attrs.width);
    }

    _getContent(video, width = 360) {
        const info = video.attributes;

        const artworkWidth = (width * window.devicePixelRatio).toString();
        const artworkHeight = Math.floor((info.artwork.height / info.artwork.width) * width * window.devicePixelRatio);
        const artworkURL = info.artwork && info.artwork.url.replace('{w}', artworkWidth).replace('{h}', artworkHeight);
        // return this._makeLargeThumbnailCard(info.name, info.artistName, artworkURL, info.contentRating === 'explicit');
        return m('.video-card-container', m(Card, {
            shadowDepth: 0,
            events: {
                onclick: () => EventCenter.emit(Events.BUTTON_PRESS, Buttons.SONG_PLAY_NOW, video),
            },
            content: [
                {
                    media: {
                        // ratio: 'square',
                        size: 'small',
                        content: m('img', {
                            src: artworkURL,
                        }),
                    },
                },
                {
                    overlay: {
                        shadowDepth: 0,
                        content: [
                            {
                                any: {
                                    content: [
                                        m('.video-card-info-container', [
                                            m('.video-card-info-background', {
                                                style: {
                                                    'background-image': `url(${artworkURL})`,
                                                },
                                            }),
                                            m('.video-card-name', info.name),
                                            info.contentRating === 'explicit' ? m('.video-card-explicit', '🅴') : null,
                                            m('.video-card-artist', info.artistName),
                                        ]),
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        }));
    }
}
