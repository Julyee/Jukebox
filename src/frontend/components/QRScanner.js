import m from 'mithril';
import {QRWorkerURL} from '../utils/QRScannerWorker';
import QRScannerImp from 'qr-scanner/src/qr-scanner';
QRScannerImp.WORKER_PATH = QRWorkerURL;

export class QRScanner {
    oninit (vnode) {
        vnode.state.targetVideoSize = vnode.attrs.videoSize ? vnode.attrs.videoSize : 250;
        vnode.state.videoSize = { w: 0, h: 0 };
        vnode.state.offset = { x: 0, y: 0 };
        vnode.state.qrScanner = null;

        vnode.state.video = document.createElement('video');
        vnode.state.video.setAttribute('autoplay', '');
        vnode.state.video.setAttribute('muted', '');
        vnode.state.video.setAttribute('playsinline', '');
        vnode.state.video.width = 0;
        vnode.state.video.height = 0;
    }

    oncreate(vnode) {
        const container = document.getElementById('qrScannerVideoElement');
        vnode.state.video.addEventListener('loadedmetadata', () => {
            this._calculateOffsets(vnode, vnode.state.video);
            vnode.state.video.width = vnode.state.videoSize.w;
            vnode.state.video.height = vnode.state.videoSize.h;
            container.appendChild(vnode.state.video);
        });

        vnode.state.qrScanner = new QRScannerImp(vnode.state.video, result => {
            if (vnode.attrs.onCode) {
                vnode.attrs.onCode(result);
            }
        });

        vnode.state.qrScanner.start();
    }

    onremove(vnode) {
        if (vnode.state.qrScanner) {
            vnode.state.qrScanner.stop();
        }
    }

    view(vnode) {
        return m('.qr-scanner-camera-container',
            m('.qr-scanner-camera', m('div', {
                style: `margin-left: -${vnode.state.offset.x}px; margin-top: -${vnode.state.offset.y}px;`,
            }, m('div', { id: 'qrScannerVideoElement' }))),
        );
    }

    _calculateOffsets(vnode, element) {
        const videoWidth = element.videoWidth;
        const videoHeight = element.videoHeight;
        let width;
        let height;

        if (videoWidth < videoHeight) {
            width = vnode.state.targetVideoSize;
            height = (videoHeight / videoWidth) * vnode.state.targetVideoSize;
        } else {
            vnode.state.videoHeight = vnode.state.targetVideoSize;
            width = (videoWidth / videoHeight) * vnode.state.targetVideoSize;
            height = vnode.state.targetVideoSize;
        }

        vnode.state.videoSize.w = Math.round(width);
        vnode.state.videoSize.h = Math.round(height);
        vnode.state.offset.x = Math.round((width - vnode.state.targetVideoSize) * 0.5);
        vnode.state.offset.y = Math.round((height - vnode.state.targetVideoSize) * 0.5);

        m.redraw();
    }
}
