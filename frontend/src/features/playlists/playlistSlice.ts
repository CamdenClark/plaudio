import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Sound } from "@plaudio/common";

import { AppThunk } from "../../store";
import { api } from "../../sources/API";

interface PlaylistState {
  top: Sound[];
}

const playlistInitialState: PlaylistState = {
  top: [],
};

const playlist = createSlice({
  name: "playlists",
  initialState: playlistInitialState,
  reducers: {
    getTopSuccess(state, { payload }: PayloadAction<Sound[]>) {
      if (payload) {
        state.top = payload;
      }
    },
  },
});

export const { getTopSuccess } = playlist.actions;

export default playlist.reducer;

export const getTopSounds = (): AppThunk => async (dispatch) => {
  try {
    const sounds = await api.loadSounds(0);
    dispatch(getTopSuccess(sounds));
  } catch (err) {
    console.log(err.toString());
  }
};
