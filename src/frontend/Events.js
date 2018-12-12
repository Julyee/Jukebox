export const Buttons = {
    DRAWER_BUTTON: 'BTN::MENU::Drawer',

    PLAYER_PLAY_BUTTON: 'BTN::PLR::Play',
    PLAYER_PAUSE_BUTTON: 'BTN::PLR::Pause',
    PLAYER_STOP_BUTTON: 'BTN::PLR::Stop',
    PLAYER_NEXT_BUTTON: 'BTN::PLR::Next',
    PLAYER_PREVIOUS_BUTTON: 'BTN::PLR::Previous',
    PLAYER_MORE_BUTTON: 'BTN::PLR::More',

    MEDIA_ITEM_PLAY_NOW: 'BTN::MEDIA::PlayNow',
    MEDIA_ITEM_SHUFFLE: 'BTN::MEDIA::Shuffle',
    MEDIA_ITEM_PLAY_KEEP_QUEUE: 'BTN::MEDIA::PlayNowKeepQueue',
    MEDIA_ITEM_PLAY_NEXT: 'BTN::MEDIA::PlayNext',
    MEDIA_ITEM_PLAY_LAST: 'BTN::MEDIA::PlayLast',

    SONG_MORE: 'BTN::SONG::More',
    SONG_ADD_TO_PLAYLIST: 'BTN::SONG::AddToPlaylist',
    SONG_CREATE_STATION: 'BTN::SONG::CreateStation',
    SONG_GO_TO_ALBUM: 'BTN::SONG::GoToAlbum',
    SONG_GO_TO_ARTIST: 'BTN::SONG::GoToArtist',

    ALBUM_OPEN_VIEW: 'BTN::ALBUM::OpenView',

    PLAYLIST_OPEN_VIEW: 'BTN::PLAYLIST::OpenView',

    ARTIST_OPEN_VIEW: 'BTN::ARTIST::OpenView',
};

export const GeneralEvents = {
    BUTTON_PRESS: 'GUI::ButtonPress',
    PLAYBACK_EVENT: 'PLR::Event',
};

export const PlaybackEvents = {
    PLAYER_TIME_CHANGE: 'PLR::TimeChange',
    PLAYER_BUFFER_CHANGE: 'PLR::BufferChange',
    PLAYER_SEEK_TO: 'PLR::SeekTo',

    SERVICE_PLAY_SONG: 'SRV::PlaySong',
};

export const PlaybackStateEvents = {
    SONG_IDLE: 'PLR::SongIdle',
    SONG_LOADING: 'PLR::SongLoading',
    SONG_PLAY: 'PLR::SongPlay',
    SONG_PAUSE: 'PLR::SongPause',
    SONG_STOP: 'PLR::SongStop',
    SONG_END: 'PLR::SongEnd',
    SONG_COMPLETE: 'PLR::SongComplete',
};

export const JukeboxEvents = {
    JUKEBOX_SOCKET_CONNECTED: 'JKB::Socket::Connected',
    JUKEBOX_SOCKET_DISCONNECTED: 'JKB::Socket::Disconnected',
    JUKEBOX_SOCKET_READY: 'JKB::Socket::Ready',
    JUKEBOX_SOCKET_CLOSED: 'JKB::Socket::Closed',
};

export const Events = Object.assign({}, GeneralEvents, PlaybackEvents, PlaybackStateEvents, JukeboxEvents);
