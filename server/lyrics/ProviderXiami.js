const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');

const searchURL = 'http://api.xiami.com/web';
// const fetchURL = 'http://api.xiami.com/web';

class ProviderXiami extends Provider {
    static search(song, artist, duration) {
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
            result.text().then(text => {
                console.log(`========== xiami ${url.toString()} ==========`);
                console.log(text);
                console.log('====================================');
            });
        });
    }
}

module.exports = ProviderXiami;
