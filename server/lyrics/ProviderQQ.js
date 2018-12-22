const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const similarity = require('string-similarity');
const he = require('he');

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
                            let bestScore = 0;
                            let bestIndex = 0;
                            searchResult.data.song.list.forEach((s, i) => {
                                let score = similarity.compareTwoStrings(s.songname, song);
                                score += similarity.compareTwoStrings(s.singer[0].name, artist);
                                score *= 0.5;
                                if (score > bestScore) {
                                    bestScore = score;
                                    bestIndex = i;
                                }
                            });

                            if (bestScore > 0.75) {
                                const s = searchResult.data.song.list[bestIndex];
                                this.fetch(s.songmid).then(lyrics => {
                                    resolve(lyrics);
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
            });
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
                        const lines = lyrics.split('\n');
                        const ret = [];
                        lines.forEach(line => {
                            const timeStampEnd = line.indexOf(']');
                            if (timeStampEnd !== -1) {
                                const timeStamp = line.substring(1, timeStampEnd);
                                const components = timeStamp.split(':');
                                if (components.length === 2) {
                                    const minutes = parseInt(components[0], 10);
                                    const seconds = parseFloat(components[1]);
                                    if (!isNaN(minutes) && !isNaN(seconds)) {
                                        const start = minutes * 60000 + seconds * 1000;
                                        if (ret.length) {
                                            ret[ret.length - 1].end = start -1;
                                            ret[ret.length - 1].duration = ret[ret.length - 1].end - ret[ret.length - 1].start;
                                        }

                                        ret.push({
                                            start: start,
                                            end: -1,
                                            duration: -1,
                                            text: line.substring(timeStampEnd + 1),
                                        });
                                    }
                                }
                            }
                        });
                        if (ret.length) {
                            resolve(ret);
                        } else {
                            resolve(null);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = ProviderQQ;
