/* global MusicKit */

import { Service } from './Service';
import m from 'mithril';

export class AppleService extends Service {
    constructor() {
        super();
        this.mAPI = null;
        this.mSearchHintCache = {};
    }

    get authorized() {
        return this.mAPI.isAuthorized;
    }

    async init(devTokenPath, appName, build) {
        const devToken = await m.request({
            method: 'GET',
            url: devTokenPath,
            deserialize: value => value,
        });
        this.mAPI = MusicKit.configure({
            developerToken: devToken,
            app: {
                name: appName,
                build: build,
            },
        });
    }

    async authorize() {
        if (!this.authorized) {
            await this.mAPI.authorize();
        }
        return this.mAPI.musicUserToken;
    }

    async unauthorize() {
        if (this.authorized) {
            return await this.mAPI.unauthorize();
        }
        return true;
    }

    async searchHints(term) {
        if (!this.mSearchHintCache.hasOwnProperty(term)) {
            await this.authorize();
            this.mSearchHintCache[term] = await this.mAPI.api.searchHints(term);
        }

        return this.mSearchHintCache[term];
    }
}
