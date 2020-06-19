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

import { Sound } from "./models/Sound";

import { createBrowserHistory } from "history";

const sounds: Sound[] = [
  {
    soundId: "snd-biden",
    text: "Biden test 1",
    url: "https://storage.googleapis.com/homophone-test/snd-biden8.mp3",
    score: 2,
    userVote: 0,
    createdAt: 1590306971,
    userId: "Bruh",
  },
  {
    soundId: "snd-biden2",
    text: "Biden test 2",
    url: "https://storage.cloud.google.com/homophone-test/snd-vivaldi.mp3",
    score: 2,
    userVote: 0,
    createdAt: 1590306941,
    userId: "Bruh",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.paper,
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

  state: AudioServiceState = {
    playing: false,
    queue: [],
    queuePosition: 0,
    duration: 0,
    currentTime: 0,
    pathname: "/",
  };

  componentDidMount() {
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

    this.loadMoreQueueItems().then((queueItems) => {
      this.setState(
        { ...this.state, queue: [...this.state.queue, ...queueItems] },
        () => {
          this.player.src = this.state.queue[this.state.queuePosition].url;
        }
      );
    });

    const history = createBrowserHistory();
    this.history = history;
    this.setState({ pathname: this.history.location.pathname });

    history.listen((location, action) => {
      console.log(action, location.pathname, location.state);
      this.setState({ pathname: location.pathname });
    });

    // this.player?.play();
  }

  async loadMoreQueueItems(): Promise<Sound[]> {
    return new Promise((resolve, _) => setTimeout(() => resolve(sounds), 100));
  }

  onPause = () => {
    this.player.pause();
    this.setState({ ...this.state, playing: false });
  };

  onPlay = () => {
    this.player.play();
    this.setState({ ...this.state, playing: true });
  };

  onNext = async () => {
    const { queue, queuePosition, playing } = this.state;
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
          () => {
            if (this.state.pathname !== "/compose") {
              this.history.push(
                `/${this.state.queue[this.state.queuePosition].soundId}`
              );
            }
            this.player.src = this.state.queue[this.state.queuePosition].url;
            if (playing) {
              this.player.play();
            }
          }
        );
      }
    } else {
      this.setState(
        {
          ...this.state,
          queuePosition: queuePosition + 1,
        },
        () => {
          if (this.state.pathname !== "/compose") {
            this.history.push(
              `/${this.state.queue[this.state.queuePosition].soundId}`
            );
          }
          if (playing) {
            this.player.src = this.state.queue[this.state.queuePosition].url;
            this.player.play();
          }
        }
      );
    }
  };

  onPrevious = () => {
    const { queuePosition, playing } = this.state;
    this.player.pause();
    if (queuePosition > 0) {
      this.setState(
        {
          ...this.state,
          queuePosition: queuePosition - 1,
        },
        () => {
          if (this.state.pathname !== "/compose") {
            this.history.push(
              `/${this.state.queue[this.state.queuePosition].soundId}`
            );
          }
          if (playing && this.player) {
            this.player.src = this.state.queue[this.state.queuePosition].url;
            this.player.play();
          }
        }
      );
    }
  };

  onVote = (vote: number): Promise<void> => {
    const { queue, queuePosition } = this.state;
    queue[queuePosition] = { ...queue[queuePosition], userVote: vote };
    this.setState({ queue });
    return new Promise((resolve, _) => resolve());
  };

  render() {
    const { queue } = this.state;
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={this.props.classes?.title}>
              <Link
                onClick={() =>
                  this.history.push(
                    `/${this.state.queue[this.state.queuePosition].soundId}`
                  )
                }
                color="inherit"
                className={this.props.classes?.titleLink}
              >
                homophone
              </Link>
            </Typography>
            <IconButton
              color={"inherit"}
              onClick={() => this.history?.push("/compose")}
            >
              <Edit />
            </IconButton>
          </Toolbar>
        </AppBar>
        {queue && queue.length > 0 && (
          <>
            {this.state.pathname === "/compose" ? (
              <ComposePage />
            ) : (
              <PlayerPage
                sound={this.state.queue[this.state.queuePosition]}
                onVote={this.onVote}
              />
            )}
            <AudioFooter
              audioState={this.state}
              sound={this.state.queue[this.state.queuePosition]}
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
