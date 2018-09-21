"use strict";

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

if (process.argv.length !== 6) {
    console.error('ERROR: Incorrect number of arguments.');
    console.warn('USAGE: music-token-encoder [PRIVATE_KEY_FILE] [TEAM_ID] [KEY_ID] [OUTPUT_FILE]')
    return;
}

const keyFilePath = path.resolve(process.cwd(), process.argv[2]);
const teamId = process.argv[3];
const keyId = process.argv[4];
const outputFile = path.resolve(process.cwd(), process.argv[5]);

const privateKey = fs.readFileSync(keyFilePath).toString();

const jwtToken = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "7d",
    issuer: teamId,
    header: {
        alg: "ES256",
        kid: keyId
    }
});

fs.writeFileSync(outputFile, jwtToken);
console.log('-----BEGIN DEV TOKEN-----');
console.log(jwtToken);
console.log('-----END DEV TOKEN-----');
