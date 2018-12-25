const log = require('../logging')('Lyrics');
const QQ = require('./ProviderQQ');
const Xiami = require('./ProviderXiami');
const NetEase = require('./ProviderNetEase');
const Syair = require('./ProviderSyair');
const Gecimi = require('./ProviderGecimi');
const Kugou = require('./ProviderKugou');

function findLyrics(song, artist, duration) {
    return new Promise(resolve => {
        QQ.search(song, artist, duration)
            .then(lyrics => {
                if (lyrics) {
                    log(`ProviderQQ found lyrics for ${song} by ${artist}`);
                } else {
                    log(`Could not find lyrics for ${song} by ${artist}`);
                }
                // cascade if needed
                resolve(lyrics);
            })
            .catch(reason => {
                log(reason);
                return null;
            });
        // Xiami.search(song, artist, duration);
        // NetEase.search(song, artist, duration);
        // Syair.search(song, artist, duration);
        // Gecimi.search(song, artist, duration);
        // Kugou.search(song, artist, duration);
    });
}

module.exports = {
    findLyrics,
};
