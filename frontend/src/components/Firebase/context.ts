import React from "react";
import Firebase from "./firebase";

const FirebaseContext: React.Context<Firebase | null> = React.createContext<Firebase | null>(
  null
);

export default FirebaseContext;
