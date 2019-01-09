const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const Lyrics = require('./Lyrics');

const searchURL = 'http://music.163.com/api/search/pc';
const fetchURL = 'http://music.163.com/api/song/lyric';

class ProviderNetEase extends Provider {
    static search(song, artist, duration) {
        return new Promise(resolve => {
            const url = new URL(searchURL);
            url.searchParams.append('s', song);
            url.searchParams.append('offset', '0');
            url.searchParams.append('limit', '10');
            url.searchParams.append('type', '1');

            fetch(url.toString(), {
                method: 'POST',
                referrer: 'http://music.163.com/',
                headers: {
                    'Referer': 'http://music.163.com/',
                },
            }).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        try {
                            const bestOption = Lyrics.pickBestOption(
                                song,
                                artist,
                                json.result.songs,
                                i => i.name,
                                i => i.artists[0].name,
                            );

                            if (bestOption.score > 0) {
                                resolve({
                                    provider: 'NetEase',
                                    score: bestOption.score,
                                    fetch: () => this.fetch(bestOption.item.id),
                                });
                            } else {
                                resolve(null);
                            }

                        } catch (e) {
                            resolve(null);
                        }
                    }).catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }

    static fetch(id) {
        return new Promise(resolve => {
            const url = new URL(fetchURL);
            url.searchParams.append('id', id);
            url.searchParams.append('lv', '1');
            url.searchParams.append('kv', '1');
            url.searchParams.append('tv', '-1');

            fetch(url.toString()).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        const lyrics = json.lrc.lyric;
                        resolve(Lyrics.parse(lyrics));
                    }).catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }
}

module.exports = ProviderNetEase;
