import m from 'mithril';
import {Card} from 'polythene-mithril';

export class LargeThumbnailCard {
    view(vnode) {
        const a = vnode.attrs;
        return this._getContent(a.title, a.subtitle, a.artworkURL, a.isExplicit);
    }

    _getContent(title, subtitle, artworkURL, isExplicit, onclick) {
        return m('.large-thumbnail-card-container', m(Card, {
            shadowDepth: 0,
            className: 'large-thumbnail-card',
            events: {
                onclick: onclick,
            },
            content: [
                {
                    media: {
                        ratio: 'square',
                        size: 'small',
                        content: m('img', {
                            src: artworkURL,
                        }),
                    },
                },
                {
                    any: {
                        content: [
                            m('.large-thumbnail-card-name', title),
                            isExplicit ? m('.large-thumbnail-card-explicit', '🅴') : null,
                            m('.large-thumbnail-card-artist', subtitle),
                        ],
                    },
                },
            ],
        }));
    }
}
