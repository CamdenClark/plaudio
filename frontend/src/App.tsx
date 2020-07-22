import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";

import { AudioFooter, Header } from "./components/Layout";

import { RealAPI } from "./sources/API";
import {
  AboutPage,
  ComposePage,
  PlayerPage,
  ProfilePage,
  SigninPage,
  SignupPage,
} from "./pages";
import { FirebaseContext } from "./components/Firebase";
import { AuthContext } from "./components/User";
import { Auth } from "./components/User/context";
import { AudioService, AudioServiceContext } from "./components/Audio";
import { SnackbarProvider } from "./components/Snackbar";

const Main = () => {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: 150,
        }}
      >
        <AudioServiceContext.Consumer>
          {({ sound }) => <Header soundId={sound?.soundId} />}
        </AudioServiceContext.Consumer>
        <div style={{ flex: "1 0 auto" }}>
          <Switch>
            <Route path={`/profile`}>
              <ProfilePage />
            </Route>
            <Route path={`/signup`}>
              <SignupPage />
            </Route>
            <Route path={`/signin`}>
              <SigninPage />
            </Route>
            <Route path={`/compose`}>
              <ComposePage />
            </Route>
            <Route path={`/about`}>
              <AboutPage />
            </Route>
            <Route path={`/:soundId`}>
              <PlayerPage />
            </Route>
            <Route path={`/`}>
              <PlayerPage />
            </Route>
          </Switch>
        </div>
        <AudioFooter />
      </div>
    </Router>
  );
};

const theme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    primary: lightGreen,
    tonalOffset: 0.2,
  },
});

function App() {
  const firebase = useContext(FirebaseContext);
  const [auth, setAuth] = useState<Auth>({
    loggedIn: false,
    api: new RealAPI(),
  });

  useEffect(() => {
    console.log("effect used");
    const unsub = firebase?.auth.onAuthStateChanged((firebaseUser) => {
      console.log("Auth state changed");
      if (firebaseUser) {
        const api = new RealAPI(firebaseUser);
        api.me().then((user) => {
          setAuth({ api, firebaseUser, loggedIn: true, user });
        });
      } else {
        console.log("Firebase user doesn't exist yet");
        const api = new RealAPI();
        setAuth({ loggedIn: false, api });
      }
    });
    return unsub;
  }, [firebase]);

  return (
    <AuthContext.Provider value={auth}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <AudioService>
            <Main />
          </AudioService>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
