import React from "react";
import { Container, Grid, IconButton, Typography } from "@material-ui/core";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(3, 2),
    flexShrink: 0,
    marginTop: "auto",
    borderTop: "1px solid " + theme.palette.grey[300],
  },
}));

export function AudioFooter({
  onPlay,
  onPause,
  audioState,
  onNext,
  onPrevious,
  sound,
}: any) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <Container maxWidth="xl">
        <Grid container direction="row" justify="center" alignItems="center">
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
              <Typography noWrap>user {sound.displayName}</Typography>
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
                <SkipPrevious style={{ fontSize: "3.5rem" }} />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                aria-label={audioState.playing ? "Pause" : "Play"}
                onClick={audioState.playing ? onPause : onPlay}
              >
                {audioState.playing ? (
                  <Pause style={{ fontSize: "3.5rem" }} />
                ) : (
                  <PlayArrow style={{ fontSize: "3.5rem" }} />
                )}
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton aria-label={"Next"} onClick={onNext}>
                <SkipNext style={{ fontSize: "3.5rem" }} />
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
      </Container>
    </footer>
  );
}

const renderDuration = (currentTime: number, duration: number) =>
  `${Math.floor(currentTime / 60)}:${(Math.floor(currentTime) % 60)
    .toString()
    .padStart(2, "0")}
    /
    ${Math.floor(duration / 60)}:${(Math.floor(duration) % 60)
    .toString()
    .padStart(2, "0")}`;
