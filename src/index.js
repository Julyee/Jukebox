import './style/main.scss';
import webRTCAdapter from 'webrtc-adapter';
import {Frontend} from './frontend/Frontend';

async function main() {
    const frontend = new Frontend(document.body);
    frontend.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log(webRTCAdapter); // eslint-disable-line
    await main().catch(reason => {
        console.error('[JUKEBOX] Unhandled ERROR: %o', reason); // eslint-disable-line
        return null;
    });
}, true);
