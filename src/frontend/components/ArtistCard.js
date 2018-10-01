import m from 'mithril';
import {Card, Icon} from 'polythene-mithril';
import {svgPathData as profilePathData} from '../../../node_modules/@fortawesome/free-solid-svg-icons/faUserCircle';
import {IconCSS} from 'polythene-css';

const iconProfile = m.trust(`<svg width="280" height="280" viewBox="-25 -25 550 550"><path d="${profilePathData}"/></svg>`);

IconCSS.addStyle('.artist-icon', {
    'size_large': 40,
});

export class ArtistCard {
    view(vnode) {
        return this._getContent(vnode.attrs.artist);
    }

    _getContent(artist) {
        const info = artist.attributes;
        const genres = info.genreNames.length ? info.genreNames.join(', ') : 'N/A';
        let albums;
        if (artist.relationships.albums && artist.relationships.albums.data.length) {
            albums = artist.relationships.albums.data.length;
            if (artist.relationships.albums.next) {
                albums += '+';
            }
            albums += ` ${artist.relationships.albums.data.length === 1 ? 'Album' : 'Albums'}`;
        } else {
            albums = 'No Albums';
        }
        return m('.artist-card-container', m(Card, {
            shadowDepth: 0,
            content: [
                {
                    any: {
                        content: [
                            m('.artist-card-icon', m(Icon, {
                                svg: iconProfile,
                                size: 'large',
                                className: 'artist-icon',
                            })),
                            m('.artist-card-info', [
                                m('.artist-card-name', info.name),
                                m('.artist-card-genre', genres),
                                m('.artist-card-genre', albums),
                            ]),
                        ],
                    },
                },
            ],
        }));
    }
}
