export const Buttons = {
    DRAWER_BUTTON: 'BTN::MENU::Drawer',

    PLAYER_PLAY_BUTTON: 'BTN::PLR::Play',
    PLAYER_PAUSE_BUTTON: 'BTN::PLR::Pause',
    PLAYER_STOP_BUTTON: 'BTN::PLR::Stop',
    PLAYER_NEXT_BUTTON: 'BTN::PLR::Next',
    PLAYER_PREVIOUS_BUTTON: 'BTN::PLR::Previous',
    PLAYER_MORE_BUTTON: 'BTN::PLR::More',

    SONG_MORE: 'BTN::SONG::More',
    SONG_PLAY_NOW: 'BTN::SONG::PlayNow',
    SONG_PLAY_KEEP_QUEUE: 'BTN::SONG::PlayNowKeepQueue',
    SONG_PLAY_NEXT: 'BTN::SONG::PlayNext',
    SONG_PLAY_LATER: 'BTN::SONG::PlayLater',
    SONG_ADD_TO_PLAYLIST: 'BTN::SONG::AddToPlaylist',
    SONG_CREATE_STATION: 'BTN::SONG::CreateStation',
    SONG_GO_TO_ALBUM: 'BTN::SONG::GoToAlbum',
    SONG_GO_TO_ARTIST: 'BTN::SONG::GoToArtist',

    ALBUM_OPEN_VIEW: 'BTN::ALBUM::OpenView',
    ALBUM_PLAY_NOW: 'BTN::ALBUM::PlayNow',
    ALBUM_PLAY_NEXT: 'BTN::ALBUM::PlayNext',
    ALBUM_PLAY_LATER: 'BTN::ALBUM::PlayLater',

    PLAYLIST_OPEN_VIEW: 'BTN::PLAYLIST::OpenView',
    PLAYLIST_PLAY_NOW: 'BTN::PLAYLIST::PlayNow',
    PLAYLIST_PLAY_NEXT: 'BTN::PLAYLIST::PlayNext',
    PLAYLIST_PLAY_LATER: 'BTN::PLAYLIST::PlayLater',

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

export const Events = Object.assign({}, GeneralEvents, PlaybackEvents, PlaybackStateEvents);
