import React from "react";

const defaultUser = { loggedIn: false, email: "" };

const UserContext = React.createContext(defaultUser);

export default UserContext;
