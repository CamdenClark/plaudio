import React from "react";
import { IAPI, RealAPI } from "../../sources/API";
import { User } from "../../models/User";

export type Auth = {
  firebaseUser?: firebase.User;
  user?: User;
  loggedIn: boolean;
  api: IAPI;
};

const defaultUser: Auth = {
  loggedIn: false,
  api: new RealAPI(),
};

const AuthContext = React.createContext(defaultUser);

export default AuthContext;
