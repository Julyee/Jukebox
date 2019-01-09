const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');
const Lyrics = require('./Lyrics');

const searchURL = 'http://gecimi.com';

class ProviderGecimi extends Provider {
    static search(song, artist) {
        return new Promise(resolve => {
            const url = new URL(`/api/lyric/${song}/${artist}`, searchURL);
            fetch(url.toString()).then(result => {
                if (result.ok) {
                    result.json().then(json => {
                        if (json.count > 0) {
                            resolve({
                                provider: 'Gecimi',
                                score: 0.999999,
                                fetch: () => this.fetch(json.result),
                            });
                        } else {
                            resolve(null);
                        }
                    }).catch(() => resolve(null));
                } else {
                    resolve(null);
                }
            }).catch(() => resolve(null));
        });
    }

    static fetch(results) {
        return new Promise(resolve => {
            this._fetchLyrics(results, 0, resolve);
        });
    }

    static _fetchLyrics(options, index, cb) {
        if (index < options.length) {
            fetch(options[index].lrc).then(result => {
                if (result.ok) {
                    result.text().then(text => {
                        const lyrics = Lyrics.parse(text);
                        if (lyrics) {
                            cb(lyrics);
                        } else {
                            this._fetchLyrics(options, index + 1, cb);
                        }
                    }).catch(() => this._fetchLyrics(options, index + 1, cb));
                } else {
                    this._fetchLyrics(options, index + 1, cb);
                }
            }).catch(() => cb(null));
        } else {
            cb(null);
        }
    }
}

module.exports = ProviderGecimi;
