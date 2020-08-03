import React, { useContext } from "react";
import { Grid, IconButton, Link, Typography } from "@material-ui/core";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";

import { AudioServiceContext } from "../Audio";

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    zIndex: 100,
    borderTop: "1px solid " + theme.palette.grey[300],
    bottom: 0,
    position: "fixed",
    width: "100%",
  },
  footerGrid: {
    padding: theme.spacing(2, 2),
  },
}));

const MemoizedAudioFooter = React.memo(
  ({ onPlay, onPause, audioState, onNext, onPrevious, sound }: any) => {
    const classes = useStyles();
    return (
      <footer className={classes.footer}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.footerGrid}
        >
          <Grid
            container
            item
            direction="column"
            justify="center"
            alignItems="center"
            xs={12}
            sm={3}
          >
            <Grid item style={{ maxWidth: "80%" }}>
              <Typography noWrap>{sound.text}</Typography>
            </Grid>
            <Grid item style={{ maxWidth: "80%" }}>
              <Typography noWrap>
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to={`/users/${sound.displayName.replace(" ", "_")}`}
                >
                  user {sound.displayName}
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            item
            direction="row"
            justify="center"
            alignItems="center"
            sm={6}
            xs={12}
          >
            <Grid item>
              <IconButton aria-label={"Previous"} onClick={onPrevious}>
                <SkipPrevious style={{ fontSize: "3rem" }} />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                aria-label={audioState.playing ? "Pause" : "Play"}
                onClick={audioState.playing ? onPause : onPlay}
              >
                {audioState.playing ? (
                  <Pause style={{ fontSize: "3rem" }} />
                ) : (
                  <PlayArrow style={{ fontSize: "3rem" }} />
                )}
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton aria-label={"Next"} onClick={onNext}>
                <SkipNext style={{ fontSize: "3rem" }} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid
            container
            item
            direction="row"
            justify="center"
            alignItems="center"
            xs={12}
            sm={3}
          >
            <Grid item>
              <Typography>
                {renderDuration(
                  audioState.currentTime || 0,
                  audioState.duration || 0
                )}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </footer>
    );
  }
);

const renderDuration = (currentTime: number, duration: number) =>
  `${Math.floor(currentTime / 60)}:${(Math.floor(currentTime) % 60)
    .toString()
    .padStart(2, "0")}
    /
    ${Math.floor(duration / 60)}:${(Math.floor(duration) % 60)
    .toString()
    .padStart(2, "0")}`;

export function AudioFooter() {
  const { audioState, onNext, onPlay, onPause, onPrevious, sound } = useContext(
    AudioServiceContext
  );
  return sound ? (
    <MemoizedAudioFooter
      audioState={audioState}
      onNext={onNext}
      onPlay={onPlay}
      onPause={onPause}
      onPrevious={onPrevious}
      sound={sound}
    />
  ) : (
    <></>
  );
}
