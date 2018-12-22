const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');

const searchURL = 'http://gecimi.com/api/lyric/';
const fetchURL = 'http://gecimi.com/api/cover';

class ProviderGecimi extends Provider {
    static search(song, artist) {
        const url = new URL(`/${song}/${artist}`, searchURL);
        fetch(url.toString()).then(result => {
            result.text().then(text => {
                console.log(`========== gecimi ${url.toString()} ==========`);
                console.log(text);
                console.log('====================================');
            });
        });
    }
}

module.exports = ProviderGecimi;
