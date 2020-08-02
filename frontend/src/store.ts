import {
  configureStore,
  createSlice,
  Action,
  createReducer,
  createAction,
} from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { Sound } from "@plaudio/common";

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state: number) => state + 1,
    decrement: (state: number) => state - 1,
  },
});

type RootState = {
  queue: Sound[];
  history: Sound[];
  current: Sound | null;
};

const queueNext = createAction("QUEUE_NEXT");
const queuePrevious = createAction("QUEUE_PREVIOUS");

createReducer<RootState>(
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

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

const store = configureStore({
  reducer: counterSlice.reducer,
});

export default store;
