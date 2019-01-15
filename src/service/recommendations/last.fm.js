import m from 'mithril';

export class LastFM {
    constructor() {
        this.mApiKey = null;
        this.mApiEndpoint = null;
    }

    async init(apiKeyPath) {
        const apiKeyInfo = await m.request({
            method: 'GET',
            url: apiKeyPath,
            deserialize: value => JSON.parse(value),
        });

        this.mApiKey = apiKeyInfo.key;
        this.mApiEndpoint = apiKeyInfo.endpoint;
    }

    async getRecommendations(song, limit = 10) {
        if (this.mApiKey && this.mApiEndpoint) {
            let result;

            result = await this.getRecommendationsBySong(song.name, song.artist, limit);
            if (result) {
                return result;
            }

            result = await this.getRecommendationsByArtist(song.artist, limit);
            if (result) {
                return result;
            }

            for (let i = 0, n = song.genres.length; i < n; ++i) {
                result = await this.getRecommendationsByGenre(song.genres[i], limit);
                if (result) {
                    return result;
                }
            }

            result = await this.getPopularRecommendations(limit);
            if (result) {
                return result;
            }
        }

        return null;
    }

    async getRecommendationsBySong(name, artist, limit = 10) {
        const result = await this._apiRequest({
            method: 'track.getSimilar',
            autocorrect: 1,
            track: name,
            artist: artist,
            limit: limit,
        });

        if (result.hasOwnProperty('error') || !result.similartracks.track.length) {
            return null;
        }

        return result.similartracks.track;
    }

    async getRecommendationsByArtist(artist, limit = 10) {
        const artists = await this._apiRequest({
            method: 'artist.getSimilar',
            autocorrect: 1,
            artist: artist,
            limit: limit,
        });

        if (artists.hasOwnProperty('error') || !artists.similarartists.artist.length) {
            return null;
        }

        const tracks = await this._apiRequest({
            method: 'artist.getTopTracks',
            mbid: artists.similarartists.artist[0].mbid,
            limit: 1,
        });

        if (tracks.hasOwnProperty('error') || !tracks.toptracks.track.length) {
            return null;
        }

        const result = await this._apiRequest({
            method: 'track.getSimilar',
            autocorrect: 1,
            mbid: tracks.toptracks.track[0].mbid,
            limit: limit,
        });

        if (result.hasOwnProperty('error') || !result.similartracks.track.length) {
            return null;
        }

        return result.similartracks.track;
    }

    async getRecommendationsByGenre(genre, limit = 10) {
        const result = await this._apiRequest({
            method: 'tag.getTopTracks',
            tag: genre,
            limit: limit,
        });

        if (result.hasOwnProperty('error') || !result.tracks.track.length) {
            return null;
        }

        return result.tracks.track;
    }

    async getPopularRecommendations(limit = 10) {
        const result = await this._apiRequest({
            method: 'chart.getTopTracks',
            limit: limit,
        });

        if (result.hasOwnProperty('error') || !result.tracks.track.length) {
            return null;
        }

        return result.tracks.track;
    }

    _apiRequest(params) {
        return m.request({
            method: 'GET',
            url: this._constructURL(params),
            deserialize: value => JSON.parse(value),
        });
    }

    _constructURL(params) {
        const url = new URL(this.mApiEndpoint);
        url.searchParams.append('api_key', this.mApiKey);
        url.searchParams.append('format', 'json');
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return url.toString();
    }
}
