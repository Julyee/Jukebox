const similarity = require('string-similarity');

class Lyrics {
    static pickBestOption(song, artist, items, getSong, getArtist) {
        const ret = {
            score: 0,
            item: null,
        };

        let score;
        items.forEach(item => {
            score = similarity.compareTwoStrings(getSong(item), song);
            score += similarity.compareTwoStrings(getArtist(item), artist);
            score *= 0.5;
            if (score > ret.score) {
                ret.score = score;
                ret.item = item;
            }
        });

        return ret;
    }

    static parse(text) {
        const lines = text.split('\n');
        const ret = [];
        lines.forEach(line => {
            const timeStampEnd = line.indexOf(']');
            if (timeStampEnd !== -1) {
                const timeStamp = line.substring(1, timeStampEnd);
                const components = timeStamp.split(':');
                if (components.length === 2) {
                    const minutes = parseInt(components[0], 10);
                    const seconds = parseFloat(components[1]);
                    if (!isNaN(minutes) && !isNaN(seconds)) {
                        const start = minutes * 60000 + seconds * 1000;
                        if (ret.length) {
                            ret[ret.length - 1].end = start -1;
                            ret[ret.length - 1].duration = ret[ret.length - 1].end - ret[ret.length - 1].start;
                        }

                        ret.push({
                            start: start,
                            end: -1,
                            duration: -1,
                            text: line.substring(timeStampEnd + 1).replace(/<[^>]*>|\r/g, ''),
                        });
                    }
                }
            }
        });

        return ret.length ? ret : null;
    }

    static parseKugou(text) {
        const lines = text.split('\n');
        const ret = [];
        lines.forEach(line => {
            const timeStampEnd = line.indexOf(']');
            if (timeStampEnd !== -1) {
                const timeStamp = line.substring(1, timeStampEnd);
                const components = timeStamp.split(',');
                if (components.length === 2) {
                    const start = parseInt(components[0], 10);
                    const duration = parseInt(components[1], 10);
                    if (!isNaN(start) && !isNaN(duration)) {
                        ret.push({
                            start: start,
                            end: start + duration,
                            duration: duration,
                            text: line.substring(timeStampEnd + 1).replace(/<[^>]*>|\r/g, ''),
                        });
                    }
                }
            }
        });
        return ret.length ? ret : null;
    }
}

module.exports = Lyrics;
