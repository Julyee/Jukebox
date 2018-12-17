import worker from 'raw-loader!qr-scanner/src/worker.js';
import binarizer from 'raw-loader!qr-scanner/src/lib/binarizer.js';
import grid from 'raw-loader!qr-scanner/src/lib/grid.js';
import version from 'raw-loader!qr-scanner/src/lib/version.js';
import detector from 'raw-loader!qr-scanner/src/lib/detector.js';
import formatinf from 'raw-loader!qr-scanner/src/lib/formatinf.js';
import errorlevel from 'raw-loader!qr-scanner/src/lib/errorlevel.js';
import bitmat from 'raw-loader!qr-scanner/src/lib/bitmat.js';
import datablock from 'raw-loader!qr-scanner/src/lib/datablock.js';
import bmparser from 'raw-loader!qr-scanner/src/lib/bmparser.js';
import datamask from 'raw-loader!qr-scanner/src/lib/datamask.js';
import rsdecoder from 'raw-loader!qr-scanner/src/lib/rsdecoder.js';
import gf256poly from 'raw-loader!qr-scanner/src/lib/gf256poly.js';
import gf256 from 'raw-loader!qr-scanner/src/lib/gf256.js';
import decoder from 'raw-loader!qr-scanner/src/lib/decoder.js';
import qrcode from 'raw-loader!qr-scanner/src/lib/qrcode.js';
import findpat from 'raw-loader!qr-scanner/src/lib/findpat.js';
import alignpat from 'raw-loader!qr-scanner/src/lib/alignpat.js';
import databr from 'raw-loader!qr-scanner/src/lib/databr.js';

const source =
    worker + '\n' +
    binarizer + '\n' +
    grid + '\n' +
    version + '\n' +
    detector + '\n' +
    formatinf + '\n' +
    errorlevel + '\n' +
    bitmat + '\n' +
    datablock + '\n' +
    bmparser + '\n' +
    datamask + '\n' +
    rsdecoder + '\n' +
    gf256poly + '\n' +
    gf256 + '\n' +
    decoder + '\n' +
    qrcode + '\n' +
    findpat + '\n' +
    alignpat + '\n' +
    databr;



const blob = new Blob([source], {type: 'application/javascript'});

export const QRWorkerURL = URL.createObjectURL(blob);
