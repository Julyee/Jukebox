const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');

const searchURL = 'http://music.163.com/api/search/pc';
const fetchURL = 'http://music.163.com/api/song/lyric';

class ProviderNetEase extends Provider {
    static search(song) {
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
            result.text().then(text => {
                console.log(`========== NetEase ${url.toString()} ==========`);
                console.log(text);
                console.log('====================================');
            });
        });
    }
}

module.exports = ProviderNetEase;
