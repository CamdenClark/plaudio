import React from "react";
import { IAPI, RealAPI } from "../../sources/API";

export type Auth = {
  user?: firebase.User;
  loggedIn: boolean;
  api: IAPI;
};

const defaultUser: Auth = {
  loggedIn: false,
  api: new RealAPI(),
};

const AuthContext = React.createContext(defaultUser);

export default AuthContext;
