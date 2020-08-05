import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Sound } from "@plaudio/common";

import { AppThunk } from "../../store";
import { api } from "../../sources/API";
import { addToQueue } from "../../features/player/playerSlice";

interface Playlist {
  sounds: Sound[];
  ttl?: number;
}

interface PlaylistState {
  top: Playlist;
  users: { [displayName: string]: Playlist };
}

const playlistInitialState: PlaylistState = {
  top: { sounds: [] },
  users: {},
};

const playlist = createSlice({
  name: "playlists",
  initialState: playlistInitialState,
  reducers: {
    getTopSuccess(state, { payload }: PayloadAction<Sound[]>) {
      if (payload) {
        state.top = { sounds: payload, ttl: Date.now() };
      }
    },
    getSoundSuccess(state, { payload }: PayloadAction<Sound>) {
      if (payload) {
        state.top.sounds.push(payload);
      }
    },
    getProfileSuccess(state, { payload }) {
      if (payload) {
        state.users[payload.displayName] = {
          sounds: payload.sounds,
          ttl: Date.now(),
        };
      }
    },
  },
});

export const {
  getProfileSuccess,
  getSoundSuccess,
  getTopSuccess,
} = playlist.actions;

export default playlist.reducer;

export const getTopSounds = (queueUp?: boolean): AppThunk => async (
  dispatch
) => {
  try {
    const sounds = await api.loadSounds(0);
    dispatch(getTopSuccess(sounds));
    if (queueUp) {
      dispatch(addToQueue(sounds));
    }
  } catch (err) {
    console.log(err.toString());
  }
};

export const getSound = (
  soundId: string,
  queueUp?: boolean
): AppThunk => async (dispatch) => {
  try {
    const sound = await api.loadSound(soundId);
    dispatch(getSoundSuccess(sound));
    if (queueUp) {
      dispatch(addToQueue([sound]));
    }
    dispatch(getTopSounds(true));
  } catch (err) {
    console.log(err.toString());
  }
};

export const getUserSounds = (displayName: string): AppThunk => async (
  dispatch
) => {
  try {
    const sounds = await api.loadProfileSounds(displayName);
    dispatch(getProfileSuccess({ displayName, sounds }));
  } catch (err) {
    console.log(err.toString());
  }
};
