import m from 'mithril';
import {QRWorkerURL} from '../utils/QRScannerWorker';
import QRScannerImp from 'qr-scanner/src/qr-scanner';
QRScannerImp.WORKER_PATH = QRWorkerURL;

export class QRScanner {
    oninit (vnode) {
        vnode.state.videoSize = vnode.attrs.videoSize ? vnode.attrs.videoSize : 250;
        vnode.state.videoElement = m('video', {
            muted: ' ',
            autoplay: ' ',
            playsinline: ' ',
        });
        vnode.state.offset = { x: 0, y: 0 };
        vnode.state.qrScanner = null;
    }

    oncreate(vnode) {
        vnode.state.qrScanner = new QRScannerImp(vnode.state.videoElement.dom, result => {
            if (vnode.attrs.onCode) {
                vnode.attrs.onCode(result);
            }
        });

        vnode.state.videoElement.dom.addEventListener('loadedmetadata', () => {
            const videoWidth = vnode.state.videoElement.dom.videoWidth;
            const videoHeight = vnode.state.videoElement.dom.videoHeight;
            let width;
            let height;

            if (videoWidth < videoHeight) {
                vnode.state.videoElement.dom.width = vnode.state.videoSize;
                width = vnode.state.videoSize;
                height = (videoHeight / videoWidth) * vnode.state.videoSize;
            } else {
                vnode.state.videoElement.dom.height = vnode.state.videoSize;
                width = (videoWidth / videoHeight) * vnode.state.videoSize;
                height = vnode.state.videoSize;
            }

            vnode.state.offset.x = Math.round((width - vnode.state.videoSize) * 0.5);
            vnode.state.offset.y = Math.round((height - vnode.state.videoSize) * 0.5);

            m.redraw();
        });

        vnode.state.qrScanner.start();
    }

    onremove(vnode) {
        if (vnode.state.qrScanner) {
            vnode.state.qrScanner.stop();
        }
        vnode.state.videoElement = null;
    }

    view(vnode) {
        return m('.qr-scanner-camera-container',
            m('.qr-scanner-camera', m('div', {
                style: `margin-left: -${vnode.state.offset.x}px; margin-top: -${vnode.state.offset.y}px;`,
            }, vnode.state.videoElement)),
        );
    }
}
