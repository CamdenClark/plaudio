import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Sound } from "@plaudio/common";

interface PlayerState {
  history: Sound[];
  queue: Sound[];
  current?: Sound;
  playing: boolean;
  currentTime: number;
}

const playerInitialState: PlayerState = {
  history: [],
  queue: [],
  currentTime: 0,
  playing: false,
};

const player = createSlice({
  name: "player",
  initialState: playerInitialState,
  reducers: {
    setQueue(state, { payload }: PayloadAction<Sound[]>) {
      if (payload) {
        let { history } = state;
        if (state.current) {
          history.push(state.current);
        }
        const existingSoundIds = new Set(
          [...history, ...state.queue].map((sound) => sound.soundId)
        );
        const [current, ...queue] = payload.filter(
          (sound) => !existingSoundIds.has(sound.soundId)
        );
        return { ...state, current, queue, history };
      }
    },
    next(state) {
      let { history, current, queue } = state;

      if (current) {
        history = [...history, current];
      }
      [current, ...queue] = queue;
      return { ...state, current, queue, history };
    },
    previous(state) {
      let { history, current, queue } = state;
      if (history.length > 0 && current) {
        state.queue = [current, ...queue];
        state.current = state.history.pop();
      }
    },
    updatePlayState(state, { payload }) {
      return { ...state, ...payload };
    },
    play(state) {
      state.playing = true;
    },
    pause(state) {
      state.playing = false;
    },
  },
});

export const {
  next,
  pause,
  play,
  previous,
  setQueue,
  updatePlayState,
} = player.actions;

export default player.reducer;
