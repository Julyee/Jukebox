export const Buttons = {
    DRAWER_BUTTON: 'BTN::MENU::Drawer',

    PLAYER_PLAY_BUTTON: 'BTN::PLR::Play',
    PLAYER_PAUSE_BUTTON: 'BTN::PLR::Pause',
    PLAYER_STOP_BUTTON: 'BTN::PLR::Stop',
    PLAYER_NEXT_BUTTON: 'BTN::PLR::Next',
    PLAYER_PREVIOUS_BUTTON: 'BTN::PLR::Previous',
    PLAYER_MORE_BUTTON: 'BTN::PLR::More',

    PLAY_SONG_BUTTON: 'BTN::SONG::Play',
    PAUSE_SONG_BUTTON: 'BTN::SONG::Pause',
    STOP_SONG_BUTTON: 'BTN::SONG::Stop',
};

export const ButtonEvents = {
    BUTTON_PRESS: 'GUI::ButtonPress',
};

export const PlaybackEvents = {
    PLAYER_TIME_CHANGE: 'PLR::TimeChange',
    PLAYER_BUFFER_CHANGE: 'PLR::BufferChange',
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

export const Events = Object.assign({}, ButtonEvents, PlaybackEvents, PlaybackStateEvents);
