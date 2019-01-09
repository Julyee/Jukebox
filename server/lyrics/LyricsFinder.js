const log = require('../logging')('Lyrics');
const QQ = require('./ProviderQQ');
const Xiami = require('./ProviderXiami');
const NetEase = require('./ProviderNetEase');
// const Syair = require('./ProviderSyair');
const Gecimi = require('./ProviderGecimi');
const Kugou = require('./ProviderKugou');

function fetchLyrics(songTitle, results, index, threshold, cb) {
    if (index < results.length) {
        const result = results[index];
        if (result && result.score >= threshold) {
            log(`Fetching lyrics ${songTitle} from ${results[index].provider}...`);
            result.fetch().then(lyrics => {
                if (lyrics) {
                    log(`Lyrics found ${songTitle} by provider ${results[index].provider}`);
                    cb(lyrics);
                } else {
                    log(`Failed to fetch lyrics ${songTitle} from provider ${results[index].provider}`);
                    fetchLyrics(songTitle, results, index + 1, threshold, cb);
                }
            }).catch(reason => {
                log(reason);
                fetchLyrics(songTitle, results, index + 1, threshold, cb);
            });
        } else {
            fetchLyrics(songTitle, results, index + 1, threshold, cb);
        }
    } else {
        log(`Could not find lyrics ${songTitle}`);
        cb(null);
    }
}

function findLyrics(song, artist, duration) {
    return new Promise(resolve => {
        const songTitle = `[${song} by ${artist}]`;
        const promises = [
            Xiami.search(song, artist, duration),
            QQ.search(song, artist, duration),
            NetEase.search(song, artist, duration),
            Kugou.search(song, artist, duration),
            Gecimi.search(song, artist, duration),
        ];

        Promise.all(promises).then(results => {
            results.sort((a, b) => {
                if (!a) return 1;
                if (!b) return -1;
                return b.score - a.score;
            });

            results.forEach(result => {
                if (result) {
                    log(`${songTitle} ${result.provider} score: ${result.score}`);
                }
            });

            fetchLyrics(songTitle, results, 0, 0.7, resolve);
        });
    });
}

module.exports = {
    findLyrics,
};
