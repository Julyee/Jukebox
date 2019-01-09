const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const Lyrics = require('./Lyrics');

const searchURL = 'http://api.xiami.com/web';
// const fetchURL = 'http://api.xiami.com/web';

class ProviderXiami extends Provider {
    static search(song, artist, duration) {
        return new Promise(resolve => {
            const url = new URL(searchURL);
            url.searchParams.append('key', song);
            url.searchParams.append('limit', '10');
            url.searchParams.append('r', 'search/songs');
            url.searchParams.append('v', '2.0');
            url.searchParams.append('app_key', '1');

            fetch(url.toString(), {
                method: 'POST',
                referrer: 'http://h.xiami.com/',
                headers: {
                    'Referer': 'http://h.xiami.com/',
                },
            }).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        try {
                            const bestOption = Lyrics.pickBestOption(
                                song,
                                artist,
                                json.data.songs,
                                i => i['song_name'],
                                i => i['artist_name'],
                            );

                            if (bestOption.score > 0) {
                                resolve({
                                    provider: 'Xiami',
                                    score: bestOption.score,
                                    fetch: () => this.fetch(bestOption.item.lyric),
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

    static fetch(url) {
        return new Promise(resolve => {
            fetch(url).then(result => {
                if (result.ok) {
                    result.text().then(text => {
                        resolve(Lyrics.parse(text));
                    }).catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }
}

module.exports = ProviderXiami;
