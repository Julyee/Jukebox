/* global MusicKit */

export class AppleMediaTools {
    static makeGeneralArtworkInfo(info) {
        const ret = {};

        if (info) {
            if (info.url.indexOf('{w}') !== -1 && info.url.indexOf('{h}') !== -1) {
                ret.url = info.url;

                if (info.hasOwnProperty('width')) {
                    ret.width = info.width;
                } else {
                    ret.width = 100;
                }

                if (info.hasOwnProperty('height')) {
                    ret.height = info.height;
                } else {
                    ret.height = 100;
                }
            } else {
                // find the size in the url
                let extension = null;
                let width = null;
                let height = null;
                let baseURL = null;
                for (let i = info.url.length - 1; i >= 0; --i) {
                    if (!extension) {
                        if (info.url[i] === '.') {
                            extension = info.url.substring(i);
                        }
                    } else if (!height) {
                        if (info.url[i] === 'x') {
                            height = info.url.substring(i + 1, info.url.length - extension.length);
                        }
                    } else if (!width) {
                        if (isNaN(info.url[i])) {
                            width = info.url.substring(i + 1, info.url.length - height.length - extension.length - 1);
                            baseURL = info.url.substring(0, i + 1);
                            break;
                        }
                    }
                }
                if (!extension || !width || !height || !baseURL || isNaN(width) || isNaN(height)) {
                    ret.url = info.url;
                    ret.width = 100;
                    ret.height = 100;
                } else {
                    ret.url = `${baseURL}{w}x{h}${extension}`;
                    ret.width = parseInt(width, 10);
                    ret.height = parseInt(height, 10);
                }
            }
        }

        return ret;
    }

    static formatMilliseconds(millis) {
        // hours:Math.floor(e/3600),minutes:Math.floor(e%3600/60)
        const totalSeconds = Math.floor(millis / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor(totalSeconds % 3600 / 60);
        const seconds = totalSeconds - hours * 3600 - minutes * 60;
        return `${hours ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    static formatArtworkURL(width, height, item) {
        if (!item.artworkURL) {
            return null;
        }

        const artworkInfo = {
            url: item.artworkURL,
            width: item.artworkSize.width,
            height: item.artworkSize.height,
        };
        return MusicKit.formatArtworkURL(artworkInfo, width, height);
    }
}
