# Jukebox
###### by  Julyee

Web music player for everyone!  
https://jukebox.julyee.com

Play music, control it from your phone, let guests add tracks from their phones, get song suggestions, use other devices as wireless speakers for a multi-room sound system, no downloads, no extra accounts, just a simple website!

Roadmap:  
- [x] Connect using Apple Music
- [x] Remotely control music
- [x] Connect devices as speakers
- [x] Use QR codes for easy connection
- [x] Display lyrics for songs
- [x] Recommend related songs
- [ ] Display guest names on music queue
- [ ] Configurable guest rules
- [ ] Save playlists remotely or locally
- [ ] Audio visualizations
- [ ] Connect using Spotify

---
### Running your own server

Clone this repository then run:
```
yarn install
```

##
#### Create an Apple Music developer token

```
 node ./keys/music-token-encoder.js [PRIVATE_KEY_FILE] [TEAM_ID] [KEY_ID] [OUTPUT_FILE] [EXPIRES_IN]
```
where `PRIVATE_KEY_FILE` is the path to the `p8` file you obtained from apple, your `TEAM_ID` as specified in your Apple developer portal, the `KEY_ID` provided by Apple (usually part of your key file name), `OUTPUT_FILE` is the path where the token should be placed (must be `./www/keys/devtoken.jwt` for this application) and `EXPIRES_IN` is the duration of the token (i.e. 31d for a duration of 31 days). For more information [check the Apple documentation.](https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens)

The resulting file must be placed in `./www/keys/` and be named `devtoken.jwt`

##
#### Create a file that holds your last.fm API key

Create a file named `last.fm.json` in the `./www/keys` folder with the following contents:
```
{
    "service": "Last.fm",
    "endpoint": "https://ws.audioscrobbler.com/2.0",
    "key": "API_KEY"
}

```
where `API_KEY` is your last.fm API key.

##
#### Create an SSL certificate

I recommend using [Let's Encrypt](https://letsencrypt.org/) as it's free and easy to use, alternatively, you could follow a guide like [this one](https://help.ubuntu.com/lts/serverguide/certificates-and-security.html.en) to create a self signed certificate.

##
#### Run the server

```
node ./server --cert [CERTIFICATE_FILE] --key [KEY_FILE]
```
where `CERTIFICATE_FILE` is the path to your SSL certificate and `KEY_FILE` is the path to your public key file.

---
### Contributing

Please log any bugs you encounter and feature requests [to our issues section](https://github.com/Julyee/Jukebox/issues).

If you wish to contribute to the code base, feel free to tackle any logged issue and/or submit pull requests.

---
### License

[MIT](https://raw.githubusercontent.com/Julyee/Jukebox/master/LICENSE)
