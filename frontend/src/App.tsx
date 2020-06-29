import React from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Edit } from "@material-ui/icons";
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";

import { ComposePage } from "./pages/ComposePage";
import { PlayerPage } from "./pages/PlayerPage";
import { AudioFooter } from "./components/AudioFooter";

import { Sound, UserSound } from "./models/Sound";
import { Listen } from "./models/Listen";
import { IAPI, RealAPI } from "./sources/API";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.paper,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  title: {
    flexGrow: 1,
  },
  titleLink: {
    cursor: "pointer",
  },
}));

type AudioState = {
  playing: boolean;
  duration: number;
  currentTime: number;
};

type AudioServiceState = {
  audioState: AudioState;
  queue: string[];
  queuePosition: number;
  sounds: Dictionary<Sound>;
  listens: Dictionary<Listen>;
};

class AudService extends React.Component<{}, AudioServiceState> {
  player: HTMLAudioElement = new Audio();
  api: IAPI = new RealAPI();

  state: AudioServiceState = {
    audioState: { playing: false, duration: 0, currentTime: 0 },
    queue: [],
    queuePosition: 0,
    sounds: {},
    listens: {},
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

    this.player.addEventListener("ended", (event) => {
      this.onNext();
    });
  }

  async loadSound(soundId: string): Promise<Sound> {
    return this.api.loadSound(soundId);
  }

  async loadMoreQueueItems(): Promise<Sound[]> {
    return this.api.loadSounds(0);
  }

  getSoundId = () => {
    const { queue, queuePosition } = this.state;
    return queue[queuePosition];
  };

  getSound = () => {
    const { sounds } = this.state;
    return sounds[this.getSoundId()];
  };

  getListen = () => {
    const { listens } = this.state;
    return listens[this.getSoundId()];
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
    this.player.src = this.getSound().url;
    if (audioState.playing) {
      this.player.play();
    }
  };

  onNext = async () => {
    const { queue, queuePosition } = this.state;
    this.player.pause();
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

  onVote = (vote: number): Promise<void> => {
    const { listens } = this.state;
    const soundId = this.getSoundId();
    if (soundId) {
      this.setState({
        listens: {
          ...listens,
          [soundId]: {
            ...listens[soundId],
            vote,
          },
        },
      });
      return this.api.vote(soundId, vote);
    }
    return new Promise((resolve, _) => {
      resolve();
    });
  };

  onSubmit = (sound: UserSound): Promise<Sound> => {
    return this.api.submit(sound);
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
    const { audioState, listens, queue, queuePosition, sounds } = this.state;
    const soundId = queuePosition < queue.length ? queue[queuePosition] : null;
    const sound = soundId && soundId.length > 0 ? sounds[soundId] : null;
    const listen = soundId && soundId.length > 0 ? listens[soundId] : null;
    return (
      <Router>
        <Header soundId={soundId} />
        <Switch>
          <Route path={`/compose`}>
            <ComposePage onSubmit={this.onSubmit} api={this.api} />
          </Route>
          <Route path={`/:soundId`}>
            <PlayerPage
              listen={listen}
              loadSounds={this.loadSounds}
              onVote={this.onVote}
              sound={sound}
              togglePlayPause={this.onToggle}
            />
          </Route>
          <Route path={`/`}>
            <PlayerPage
              listen={listen}
              loadSounds={this.loadSounds}
              onVote={this.onVote}
              sound={sound}
              togglePlayPause={this.onToggle}
            />
          </Route>
        </Switch>
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
      </Router>
    );
  }
}

const Header = ({ soundId }: { soundId: string | null }) => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          <Link
            onClick={() => history.push(`/${soundId || ""}`)}
            color="inherit"
            className={classes.titleLink}
          >
            homophone
          </Link>
        </Typography>
        <IconButton
          aria-label={"Compose"}
          color={"inherit"}
          onClick={() => history.push("/compose")}
        >
          <Edit />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

const theme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    primary: lightGreen,
    tonalOffset: 0.2,
  },
});

interface Dictionary<T> {
  [key: string]: T;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AudService />
    </ThemeProvider>
  );
}

export default App;
