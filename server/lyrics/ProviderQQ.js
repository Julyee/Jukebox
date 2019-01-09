const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const he = require('he');
const Lyrics = require('./Lyrics');

const searchURL = 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp';
const fetchURL = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';

class ProviderQQ extends Provider {
    static search(song, artist) {
        return new Promise(resolve => {
            const url = new URL(searchURL);
            url.searchParams.append('w', song);

            fetch(url.toString()).then(result => {
                if (result.ok) {
                    result.text().then(text => {
                        const searchResult = JSON.parse(text.substring(9, text.length - 1));
                        try {
                            const bestOption = Lyrics.pickBestOption(
                                song,
                                artist,
                                searchResult.data.song.list,
                                i => i.songname,
                                i => i.singer[0].name,
                            );

                            if (bestOption.score > 0) {
                                resolve({
                                    provider: 'QQ',
                                    score: bestOption.score,
                                    fetch: () => this.fetch(bestOption.item.songmid),
                                });
                            } else {
                                resolve(null);
                            }

                        } catch (e) {
                            resolve(null);
                        }
                    });
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }

    static fetch(id) {
        return new Promise(resolve => {
            const url = new URL(fetchURL);
            url.searchParams.append('songmid', id);
            url.searchParams.append('g_tk', '5381');

            fetch(url.toString(), {
                referrer: 'y.qq.com/portal/player.html',
                headers: {
                    'Referer': 'y.qq.com/portal/player.html',
                },
            }).then(result => {
                if (result.ok) {
                    result.text().then(text => {
                        const r = JSON.parse(text.substring(18, text.length - 1));
                        const lyrics = he.decode((new Buffer(r.lyric, 'base64')).toString('UTF8'));
                        resolve(Lyrics.parse(lyrics));
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = ProviderQQ;
