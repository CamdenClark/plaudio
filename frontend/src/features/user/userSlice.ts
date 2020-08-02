import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk } from "../../store";
import { User } from "@plaudio/common";
import { api } from "../../sources/API";

interface UserState {
  loggedIn: boolean;
  user?: User;
}

const userInitialState: UserState = {
  loggedIn: false,
};

const user = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {
    getUserSuccess(state, { payload }: PayloadAction<User>) {
      if (payload) {
        state.user = payload;
        state.loggedIn = true;
      } else {
        state.user = undefined;
        state.loggedIn = false;
      }
    },
    logOut(state) {
      state.user = undefined;
      state.loggedIn = false;
    },
  },
});

export const { getUserSuccess, logOut } = user.actions;

export default user.reducer;

export const fetchMe = (): AppThunk => async (dispatch) => {
  try {
    const user = await api.me();
    dispatch(getUserSuccess(user));
  } catch (err) {
    console.log(err.toString());
  }
};
