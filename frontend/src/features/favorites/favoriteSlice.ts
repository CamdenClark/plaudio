import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk } from "../../store";
import { User, Favorite } from "@plaudio/common";
import { api } from "../../sources/API";

type StoreFavorite = {
  loaded: boolean;
  score: number;
  oldScore: number;
  soundId: string;
};

interface FavoriteState {
  [soundId: string]: StoreFavorite;
}

const userInitialState: FavoriteState = {};

const favorites = createSlice({
  name: "favorites",
  initialState: userInitialState,
  reducers: {
    getFavoriteSuccess(
      state,
      { payload }: PayloadAction<Partial<StoreFavorite>>
    ) {
      if (payload && payload.soundId) {
        state[payload.soundId] = {
          ...state[payload.soundId],
          ...payload,
          loaded: true,
        };
      }
    },
    setFavoriteSuccess(
      state,
      { payload }: PayloadAction<Partial<StoreFavorite>>
    ) {
      if (payload && payload.soundId) {
        state[payload.soundId] = {
          ...state[payload.soundId],
          ...payload,
          loaded: true,
        };
      }
    },
  },
});

export const { getFavoriteSuccess, setFavoriteSuccess } = favorites.actions;

export default favorites.reducer;

export const getFavorite = (soundId: string): AppThunk => async (dispatch) => {
  try {
    const { score } = await api.getFavorite(soundId);
    dispatch(setFavoriteSuccess({ soundId, score, oldScore: score }));
  } catch (err) {
    console.log(err.toString());
  }
};

export const setFavorite = (soundId: string, score: number): AppThunk => async (
  dispatch
) => {
  try {
    dispatch(setFavoriteSuccess({ soundId, score }));
    await api.favorite(soundId, score);
  } catch (err) {
    console.log(err.toString());
  }
};
