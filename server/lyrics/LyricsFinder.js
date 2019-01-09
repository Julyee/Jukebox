const log = require('../logging')('Lyrics');
const QQ = require('./ProviderQQ');
const Xiami = require('./ProviderXiami');
const NetEase = require('./ProviderNetEase');
// const Syair = require('./ProviderSyair');
const Gecimi = require('./ProviderGecimi');
const Kugou = require('./ProviderKugou');

function findLyrics(song, artist, duration) {
    return new Promise(resolve => {
        // Kugou.search(song, artist, duration);
        // resolve(null);
        // return;
        Kugou.search(song, artist, duration).then(result => {
            if (result) {
                result.fetch().then(lyrics => {
                    resolve(lyrics);
                }).catch(() => resolve(null));
            } else {
                resolve(null);
            }
        });
    });

    return new Promise(resolve => {
        const songTitle = `(${song} by ${artist})`;
        const promises = [
            Xiami.search(song, artist, duration),
            QQ.search(song, artist, duration),
            NetEase.search(song, artist, duration),
            Gecimi.search(song, artist, duration),
        ];

        Promise.all(promises).then(results => {
            let bestScore = 0;
            let index = -1;
            results.forEach((result, i) => {
                if (result) {
                    log(`${songTitle} ${result.provider} score: ${result.score}`);
                    if (result.score > bestScore) {
                        bestScore = result.score;
                        index = i;
                    }
                }
            });

            if (index >= 0 && bestScore > 0.75) {
                log(`Fetching lyrics ${songTitle} from ${results[index].provider}...`);
                results[index].fetch().then(lyrics => {
                    if (lyrics) {
                        log(`Lyrics found ${songTitle} by provider ${results[index].provider}`);
                        resolve(lyrics);
                    } else {
                        log(`Failed to fetch lyrics ${songTitle} from provider ${results[index].provider}`);
                    }
                }).catch(reason => {
                    log(reason);
                    resolve(null);
                });
            } else {
                log(`Could not find lyrics ${songTitle}`);
                resolve(null);
            }
        });
    });
}

module.exports = {
    findLyrics,
};
