const argv = require('minimist')(process.argv.slice(2));
const HTTPSServer = require('./HTTPSServer');
const JukeboxSocket = require('./JukeboxSocket');

function main() {
    const options = {
        host: '0.0.0.0',
        httpPort: 80,
        httpsPort: 443,
        cert: 'file.crt',
        key: 'file.pem',
    };

    if (argv.hasOwnProperty('h') || argv.hasOwnProperty('help')) {
        console.log('USAGE:');
        console.log('--host [SERVER_HOST]');
        console.log('--cert [HTTPS_CERT]');
        console.log('--key [HTTPS_KEY]');
        console.log('--http [HTTP_PORT');
        console.log('--https [HTTPS_PORT]');

        return;
    }

    if (argv.hasOwnProperty('host')) {
        options.host = argv['host'];
    }

    if (argv.hasOwnProperty('cert')) {
        options.cert = argv['cert'];
    }

    if (argv.hasOwnProperty('key')) {
        options.key = argv['key'];
    }

    if (argv.hasOwnProperty('http')) {
        options.httpPort = parseInt(argv['http'], 10);
    }

    if (argv.hasOwnProperty('https')) {
        options.httpsPort = parseInt(argv['https'], 10);
    }

    const server = new HTTPSServer(options);
    const socket = new JukeboxSocket(server.serverHTTPS);
    server.start();
}

main();
