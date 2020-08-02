import React from "react";
import { User } from "../../models/User";

export type Auth = {
  user?: User;
  loggedIn: boolean;
};

const defaultUser: Auth = {
  loggedIn: false,
};

const AuthContext = React.createContext(defaultUser);

export default AuthContext;
