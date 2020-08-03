import { configureStore, Action } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";

import user from "./features/user/userSlice";
import favorites from "./features/favorites/favoriteSlice";
import player from "./features/player/playerSlice";

/*

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state: number) => state + 1,
    decrement: (state: number) => state - 1,
  },
});

const queueNext = createAction("QUEUE_NEXT");
const queuePrevious = createAction("QUEUE_PREVIOUS");

createReducer(
  {
    queue: [],
    history: [],
    current: null,
  },
  {
    [queueNext.type]: (state, action) => {
      if (state.current) {
        state.history = [...state.history, state.current];
      }
      const next = state.queue.pop();
      if (next) {
        state.current = next;
      }
      return state;
    },
    [queuePrevious.type]: (state, action) => {
      const previous = state.history.pop();
      if (previous) {
        if (state.current) {
          state.queue.push(state.current);
        }
        state.current = previous;
      }
      return state;
    },
  }
);
*/

const store = configureStore({
  reducer: {
    auth: user,
    favorites,
    player,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
