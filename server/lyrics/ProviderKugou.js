const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const Lyrics = require('./Lyrics');
const zlib = require('zlib');

const searchURL = 'http://lyrics.kugou.com/search';
const fetchURL = 'http://lyrics.kugou.com/download';

const decodeKey = new Uint8Array([64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105]);

class ProviderKugou extends Provider {
    static search(song, artist, duration) {
        return new Promise(resolve => {
            const url = new URL(searchURL);
            url.searchParams.append('keyword', song);
            url.searchParams.append('duration', duration);
            url.searchParams.append('client', 'pc');
            url.searchParams.append('ver', '1');
            url.searchParams.append('man', 'yes');

            fetch(url.toString()).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        try {
                            const bestOption = Lyrics.pickBestOption(
                                song,
                                artist,
                                json.candidates,
                                i => i.song,
                                i => i.singer,
                            );

                            if (bestOption.score > 0) {
                                resolve({
                                    provider: 'Kugou',
                                    score: bestOption.score,
                                    fetch: () => this.fetch(bestOption.item.id, bestOption.item.accesskey),
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

    static fetch(id, accessKey) {
        return new Promise(resolve => {
            const url = new URL(fetchURL);
            url.searchParams.append('id', id);
            url.searchParams.append('accesskey', accessKey);
            url.searchParams.append('fmt', 'krc');
            url.searchParams.append('charset', 'utf8');
            url.searchParams.append('client', 'pc');
            url.searchParams.append('ver', '1');

            fetch(url.toString()).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        const buffer = Buffer.from(json.content, 'base64');
                        const n = buffer.length;
                        const decrypted = Buffer.alloc(n - 4);
                        const encodeKey = 'krc1';
                        for (let i = 0; i < n; ++i) {
                            if (i < 4) {
                                if (buffer.readUInt8(i) !== encodeKey.charCodeAt(i)) {
                                    resolve(null);
                                    return;
                                }
                            } else {
                                decrypted[i - 4] = buffer.readUInt8(i) ^ decodeKey[(i - 4) & 0b1111];
                            }
                        }

                        zlib.inflate(decrypted, {}, (error, inflated) => {
                            if (error) {
                                resolve(null);
                            } else {
                                resolve(Lyrics.parseKugou(inflated.toString()));
                            }
                        });
                    }).catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }
}

module.exports = ProviderKugou;
