import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";

import { AudioFooter, Header } from "./components/Layout";

import {
  AboutPage,
  ComposePage,
  PlayerPage,
  ProfilePage,
  SigninPage,
  SignupPage,
} from "./pages";
import { FirebaseContext } from "./components/Firebase";
import { AudioService, AudioServiceContext } from "./components/Audio";
import { SnackbarProvider } from "./components/Snackbar";

import { useDispatch } from "react-redux";
import { fetchMe, logOut } from "./features/user/userSlice";

const Main = () => {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "12rem",
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
            <Route path={`/users/:displayName`}>
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
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = firebase?.auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        dispatch(fetchMe());
      } else {
        dispatch(logOut());
      }
    });
    return unsub;
  }, [dispatch, firebase]);

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AudioService>
          <Main />
        </AudioService>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
