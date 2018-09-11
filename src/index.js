import './style/main.scss';
import {Frontend} from './frontend/Frontend';

async function main() {
    const frontend = new Frontend(document.body);
    frontend.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
    await main();
}, true);
