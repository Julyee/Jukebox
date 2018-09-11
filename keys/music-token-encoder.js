"use strict";

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync(path.resolve(__dirname, './AuthKey_B5398RR63L.p8')).toString();
const teamId     = "52PP2L8QS9";
const keyId      = "B5398RR63L";

const jwtToken = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "7d",
    issuer: teamId,
    header: {
        alg: "ES256",
        kid: keyId
    }
});

fs.writeFileSync(path.resolve(__dirname, "../www/devtoken.jwt"), jwtToken);
console.log('-----BEGIN DEV TOKEN-----');
console.log(jwtToken);
console.log('-----END DEV TOKEN-----');
