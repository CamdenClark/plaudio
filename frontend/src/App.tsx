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
import { IAPI, RealAPI } from "./sources/API";

import { createBrowserHistory } from "history";

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

type AudioServiceProps = {
  classes: any;
};

type AudioServiceState = {
  playing: boolean;
  queue: Sound[];
  queuePosition: number;
  duration: number;
  currentTime: number;
  pathname: string;
};

class AudioService extends React.Component<
  AudioServiceProps,
  AudioServiceState
> {
  player: HTMLAudioElement = new Audio();
  history: any;
  api: IAPI = new RealAPI();

  state: AudioServiceState = {
    playing: false,
    queue: [],
    queuePosition: 0,
    duration: 0,
    currentTime: 0,
    pathname: "/",
  };

  componentDidMount() {
    document.addEventListener("keypress", (event) => {
      if (
        event.code === "Space" &&
        this.history.location.pathname !== "/compose" &&
        !["Play", "Pause", "Next", "Previous"].includes(
          (event.target as any)?.ariaLabel
        )
      ) {
        if (this.state.playing) {
          this.onPause();
        } else {
          this.onPlay();
        }
      }
    });

    this.player.addEventListener("timeupdate", (event) => {
      const audioElement = event.target as HTMLAudioElement;
      const { currentTime, duration } = audioElement;
      this.setState({
        ...this.state,
        currentTime,
        duration,
      });
    });

    this.player.addEventListener("ended", (event) => {
      this.onNext();
    });

    const history = createBrowserHistory();
    this.history = history;

    if (this.history.location.pathname.startsWith("/snd")) {
      this.loadSound(this.history.location.pathname.substr(1)).then((sound) => {
        console.log(sound);
        this.setState(
          { ...this.state, queue: [sound, ...this.state.queue] },
          () => {
            this.player.src = this.state.queue[this.state.queuePosition].url;
          }
        );
      });
    } else {
      this.loadMoreQueueItems().then((sounds) => {
        this.setState(
          { ...this.state, queue: [...this.state.queue, ...sounds] },
          () => {
            this.player.src = this.state.queue[this.state.queuePosition].url;
          }
        );
      });
    }

    this.setState({ pathname: this.history.location.pathname });

    history.listen((location, action) => {
      console.log(action, location.pathname, location.state);
      this.setState({ pathname: location.pathname });
    });
  }

  async loadSound(soundId: string): Promise<Sound> {
    return this.api.loadSound(soundId);
  }

  async loadMoreQueueItems(): Promise<Sound[]> {
    return this.api.loadSounds(0);
  }

  onPause = () => {
    this.player.pause();
    this.setState({ ...this.state, playing: false });
  };

  onPlay = () => {
    this.player.play();
    this.setState({ ...this.state, playing: true });
  };

  onResync = () => {
    const { queue, queuePosition, pathname, playing } = this.state;
    if (pathname !== "/compose") {
      this.history.push(`/${queue[queuePosition].soundId}`);
    }
    this.player.src = queue[queuePosition].url;
    if (playing) {
      this.player.play();
    }
  };

  onNext = async () => {
    const { queue, queuePosition } = this.state;
    this.player.pause();
    if (queuePosition >= queue.length - 1) {
      const newQueueItems = await this.loadMoreQueueItems();
      if (newQueueItems.length > 0) {
        this.setState(
          {
            ...this.state,
            queue: [...queue, ...newQueueItems],
            queuePosition: queuePosition + 1,
          },
          this.onResync
        );
      }
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
    const { queue, queuePosition } = this.state;
    queue[queuePosition] = { ...queue[queuePosition], userVote: vote };
    this.setState({ queue });
    return this.api.vote(queue[queuePosition].soundId, vote);
  };

  onSubmit = (sound: UserSound): Promise<Sound> => {
    return this.api.submit(sound);
  };

  render() {
    const { queue, queuePosition, pathname } = this.state;
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={this.props.classes?.title}>
              <Link
                onClick={() =>
                  this.history.push(`/${queue[queuePosition].soundId}`)
                }
                color="inherit"
                className={this.props.classes?.titleLink}
              >
                homophone
              </Link>
            </Typography>
            <IconButton
              aria-label={"Compose"}
              color={"inherit"}
              onClick={() => this.history.push("/compose")}
            >
              <Edit />
            </IconButton>
          </Toolbar>
        </AppBar>
        {queue && queue.length > 0 && (
          <>
            {pathname === "/compose" ? (
              <ComposePage onSubmit={this.onSubmit} api={this.api} />
            ) : (
              <PlayerPage sound={queue[queuePosition]} onVote={this.onVote} />
            )}
            <AudioFooter
              audioState={this.state}
              sound={queue[queuePosition]}
              onPause={this.onPause}
              onPrevious={this.onPrevious}
              onPlay={this.onPlay}
              onNext={this.onNext}
            />
          </>
        )}
      </>
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
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <AudioService classes={classes} />
      </div>
    </ThemeProvider>
  );
}

export default App;
