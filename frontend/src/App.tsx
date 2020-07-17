import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";

import { AudioFooter, Header } from "./components/Layout";

import { Sound, UserSound } from "./models/Sound";

import { IAPI, RealAPI } from "./sources/API";
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

interface Dictionary<T> {
  [key: string]: T;
}

type AudioState = {
  playing: boolean;
  duration: number;
  currentTime: number;
};

type AudioServiceProps = {
  api: IAPI;
};

type AudioServiceState = {
  audioState: AudioState;
  queue: string[];
  queuePosition: number;
  sounds: Dictionary<Sound>;
};

class AudioService extends React.Component<
  AudioServiceProps,
  AudioServiceState
> {
  player: HTMLAudioElement = new Audio();

  state: AudioServiceState = {
    audioState: { playing: false, duration: 0, currentTime: 0 },
    queue: [],
    queuePosition: 0,
    sounds: {},
  };

  componentDidMount() {
    this.player.addEventListener("timeupdate", (event) => {
      const audioElement = event.target as HTMLAudioElement;
      const { currentTime, duration } = audioElement;
      this.setState({
        ...this.state,
        audioState: { ...this.state.audioState, currentTime, duration },
      });
    });

    this.player.addEventListener("durationchange", (event) => {
      const audioElement = event.target as HTMLAudioElement;
      const { duration } = audioElement;
      this.setState({
        ...this.state,
        audioState: { ...this.state.audioState, duration },
      });
    });

    this.player.addEventListener("ended", (event) => {
      this.onNext();
    });
  }

  async loadSound(soundId: string): Promise<Sound> {
    return this.props.api.loadSound(soundId);
  }

  async loadMoreQueueItems(): Promise<Sound[]> {
    return this.props.api.loadSounds(0);
  }

  anySound = () => {
    const { queue, queuePosition } = this.state;
    if (queuePosition < 0 || queuePosition >= queue.length) {
      return false;
    }
    return true;
  };

  getSoundId = () => {
    const { queue, queuePosition } = this.state;
    return queue[queuePosition];
  };

  getSound = () => {
    const { sounds } = this.state;
    return sounds[this.getSoundId()];
  };

  onPause = () => {
    this.player.pause();
    this.setState({
      ...this.state,
      audioState: { ...this.state.audioState, playing: false },
    });
  };

  onPlay = () => {
    this.player.play();
    this.setState({
      ...this.state,
      audioState: { ...this.state.audioState, playing: true },
    });
  };

  onToggle = () => {
    if (this.state.audioState.playing) {
      this.onPause();
    } else {
      this.onPlay();
    }
  };

  onResync = () => {
    const { audioState } = this.state;
    if (this.anySound()) {
      this.player.src = this.getSound().url;
      if (audioState.playing) {
        this.player.play();
      }
    }
  };

  onNext = async () => {
    const { queue, queuePosition } = this.state;
    if (queuePosition >= queue.length - 1) {
      this.loadSounds({ next: true });
    } else {
      this.setState(
        {
          ...this.state,
          queuePosition: queuePosition + 1,
        },
        this.onResync
      );
    }
  };

  onPrevious = () => {
    const { queuePosition } = this.state;
    if (queuePosition > 0) {
      this.player.pause();
      this.setState(
        {
          ...this.state,
          queuePosition: queuePosition - 1,
        },
        this.onResync
      );
    }
  };

  onSubmit = (sound: UserSound): Promise<Sound> => {
    return this.props.api.submit(sound);
  };

  loadSounds = (options?: { soundId?: string; next?: boolean }) => {
    if (options?.soundId) {
      this.loadSound(options.soundId).then((sound) => {
        const { sounds, queue } = this.state;
        this.setState(
          {
            ...this.state,
            queue: [sound.soundId, ...queue],
            sounds: { ...sounds, [sound.soundId]: sound },
          },
          () => {
            this.onResync();
          }
        );
      });
    } else {
      this.loadMoreQueueItems().then((newSounds) => {
        const { sounds, queue, queuePosition } = this.state;
        this.setState(
          {
            ...this.state,
            queue: [...queue, ...newSounds.map((snd) => snd.soundId)],
            sounds: Object.assign(
              sounds,
              ...newSounds.map((snd) => ({ [snd.soundId]: snd }))
            ),
            queuePosition: options?.next ? queuePosition + 1 : queuePosition,
          },
          () => {
            this.onResync();
          }
        );
      });
    }
  };

  render() {
    const { audioState, queue, queuePosition, sounds } = this.state;
    const soundId = queuePosition < queue.length ? queue[queuePosition] : null;
    const sound = soundId && soundId.length > 0 ? sounds[soundId] : null;
    return (
      <Router>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Header soundId={soundId} />
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
                <ComposePage onSubmit={this.onSubmit} api={this.props.api} />
              </Route>
              <Route path={`/:soundId`}>
                <PlayerPage loadSounds={this.loadSounds} sound={sound} />
              </Route>
              <Route path={`/`}>
                <PlayerPage loadSounds={this.loadSounds} sound={sound} />
              </Route>
            </Switch>
          </div>
          {sound && (
            <AudioFooter
              audioState={audioState}
              sound={sound}
              onPause={this.onPause}
              onPrevious={this.onPrevious}
              onPlay={this.onPlay}
              onNext={this.onNext}
            />
          )}
        </div>
      </Router>
    );
  }
}

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
        <AudioService api={auth.api} />
        <DisplayNameModal onSubmit={displayNameModalSubmit} />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
