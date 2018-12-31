import './style/main.scss';
import webRTCAdapter from 'webrtc-adapter';
import {Frontend} from './frontend/Frontend';

async function main() {
    const frontend = new Frontend(document.body);
    frontend.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log(webRTCAdapter); // eslint-disable-line
    main().catch(reason => {
        console.error('[JUKEBOX] Unhandled ERROR: %o', reason); // eslint-disable-line
        return null;
    });
}, true);
