const Provider = require('./Provider');
const URL = require('url').URL;
const fetch = require('node-fetch');

const searchURL = 'https://syair.info/search';
const fetchURL = 'https://syair.info';

class ProviderSyair extends Provider {
    static search(song, artist) {
        const url = new URL(searchURL);
        url.searchParams.append('title', song);
        url.searchParams.append('artist', artist);

        fetch(url.toString()).then(result => {
            result.text().then(text => {
                console.log(`========== Syair ${url.toString()} ==========`);
                console.log(text);
                console.log('====================================');
            });
        });
    }
}

module.exports = ProviderSyair;
