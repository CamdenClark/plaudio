import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";

import { AudioFooter, Header } from "./components/Layout";

import { Sound } from "./models/Sound";

import { RealAPI } from "./sources/API";
import {
  ComposePage,
  PlayerPage,
  ProfilePage,
  SigninPage,
  SignupPage,
} from "./pages";
import { FirebaseContext } from "./components/Firebase";
import { AuthContext } from "./components/User";
import { Auth } from "./components/User/context";
import { DisplayNameModal } from "./components/Auth/DisplayNameModal";

type AudioState = {
  playing: boolean;
  duration: number;
  currentTime: number;
};

const AudioServiceContext = React.createContext({});

const NewAudioService = (props: any) => {
  const player = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState({} as AudioState);
  const [queue, setQueue] = useState([] as Sound[]);
  const [queuePosition, setQueuePosition] = useState(0);

  const auth = useContext(AuthContext);

  const { current } = player;

  const loadSounds = useCallback(
    (next: boolean, soundId?: string) => {
      if (soundId) {
        auth.api.loadSound(soundId).then((sound) => {
          setQueue([sound, ...queue]);
          if (next) {
            setQueuePosition(queuePosition + 1);
          }
        });
      } else {
        auth.api.loadSounds(0).then((sounds) => {
          setQueue([...queue, ...sounds]);
          if (next) {
            setQueuePosition(queuePosition + 1);
          }
        });
      }
    },
    [auth, queue, queuePosition, setQueue, setQueuePosition]
  );

  const onNext = useCallback(() => {
    if (queuePosition < queue.length - 1) {
      setQueuePosition(queuePosition + 1);
    } else {
      loadSounds(true);
    }
  }, [loadSounds, queue, queuePosition]);

  const anySound = queuePosition >= 0 && queuePosition < queue.length;
  const sound = anySound ? queue[queuePosition] : null;

  useEffect(() => {
    if (current) {
      const endedListener = (_: any) => {
        onNext();
      };
      current.addEventListener("ended", endedListener);

      return () => {
        current.removeEventListener("ended", endedListener);
      };
    }
  }, [current, onNext]);

  useEffect(() => {
    if (current) {
      const timeUpdate = (event: any) => {
        const audioElement = event.target as HTMLAudioElement;
        const { currentTime, duration } = audioElement;
        setAudioState({ ...audioState, currentTime, duration });
      };

      const durationChange = (event: any) => {
        const audioElement = event.target as HTMLAudioElement;
        const { currentTime, duration } = audioElement;
        setAudioState({ ...audioState, currentTime, duration });
      };

      current.addEventListener("timeupdate", timeUpdate);
      current.addEventListener("durationchange", durationChange);

      return () => {
        current.removeEventListener("timeupdate", timeUpdate);
        current.removeEventListener("durationchange", durationChange);
      };
    }
  }, [audioState, current, setAudioState]);

  const onPause = useCallback(() => {
    if (current) {
      current.pause();
      setAudioState({ ...audioState, playing: false });
    }
  }, [audioState, current, setAudioState]);

  const onPlay = useCallback(() => {
    if (current) {
      current.play();
      setAudioState({ ...audioState, playing: true });
    }
  }, [audioState, current, setAudioState]);

  const onPrevious = () => {
    if (queuePosition > 0) {
      setQueuePosition(queuePosition - 1);
    }
  };

  useEffect(() => {
    if (current && sound && current.src !== sound.url) {
      current.src = sound.url;
      if (audioState.playing) {
        current.play();
      }
    }
  }, [audioState, current, onPause, onPlay, sound]);

  const context = {
    audioState,
    loadSounds,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    queue,
    queuePosition,
    sound,
  };

  return (
    <AudioServiceContext.Provider value={context}>
      <audio ref={player} />
      {props.children}
    </AudioServiceContext.Provider>
  );
};

const AudioService = () => {
  return (
    <AudioServiceContext.Consumer>
      {({
        audioState,
        loadSounds,
        onPause,
        onPlay,
        onNext,
        onPrevious,
        sound,
        queue,
        queuePosition,
      }: any) => (
        <Router>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 100,
            }}
          >
            <Header soundId={sound?.soundId} />
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
                <Route path={`/:soundId`}>
                  <PlayerPage
                    loadSounds={loadSounds}
                    sound={sound}
                    queue={queue}
                    queuePosition={queuePosition}
                  />
                </Route>
                <Route path={`/`}>
                  <PlayerPage
                    loadSounds={loadSounds}
                    sound={sound}
                    queue={queue}
                    queuePosition={queuePosition}
                  />
                </Route>
              </Switch>
            </div>
            {sound && (
              <AudioFooter
                audioState={audioState}
                sound={sound}
                onPause={onPause}
                onPrevious={onPrevious}
                onPlay={onPlay}
                onNext={onNext}
              />
            )}
          </div>
        </Router>
      )}
    </AudioServiceContext.Consumer>
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

  const displayNameModalSubmit = (name: string) => {
    const { api, user } = auth;
    if (user) {
      return api.updateProfile({ name }).then(() => {
        setAuth({ ...auth, user: { ...user, name } });
      });
    }
  };

  useEffect(() => {
    console.log("effect used");
    const unsub = firebase?.auth.onAuthStateChanged((firebaseUser) => {
      console.log("Auth state changed");
      if (firebaseUser) {
        const api = new RealAPI(firebaseUser);
        api.me().then((user) => {
          if (!user) {
            // The firebase signup function hasn't triggered yet.
            // We can optimistically set some user parameters
            setAuth({
              api,
              firebaseUser,
              loggedIn: true,
              user: {
                email: firebaseUser.email || "",
                id: firebaseUser.uid,
                admin: false,
                name: "",
              },
            });
          } else {
            setAuth({ api, firebaseUser, loggedIn: true, user });
          }
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
        <NewAudioService>
          <AudioService />
          <DisplayNameModal onSubmit={displayNameModalSubmit} />
        </NewAudioService>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
