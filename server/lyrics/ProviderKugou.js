const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');

const searchURL = 'http://lyrics.kugou.com/search';
const fetchURL = 'http://lyrics.kugou.com/download';

class ProviderKugou extends Provider {
    static search(song, artist, duration) {
        const url = new URL(searchURL);
        url.searchParams.append('keyword', song);
        url.searchParams.append('duration', duration);
        url.searchParams.append('client', 'pc');
        url.searchParams.append('ver', '1');
        url.searchParams.append('man', 'yes');

        fetch(url.toString()).then(result => {
            result.text().then(text => {
                console.log(`========== kugou ${url.toString()} ==========`);
                console.log(text);
                console.log('====================================');
            });
        });
    }
}

module.exports = ProviderKugou;
