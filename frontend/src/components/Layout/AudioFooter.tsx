import React from "react";
import { Grid, IconButton, Link, Typography } from "@material-ui/core";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { next, pause, play, previous } from "../../features/player/playerSlice";

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

const renderDuration = (currentTime: number, duration: number) =>
  `${Math.floor(currentTime / 60)}:${(Math.floor(currentTime) % 60)
    .toString()
    .padStart(2, "0")}
    /
    ${Math.floor(duration / 60)}:${(Math.floor(duration) % 60)
    .toString()
    .padStart(2, "0")}`;

export function AudioFooter() {
  const dispatch = useDispatch();
  const onNext = () => dispatch(next());
  const onPause = () => dispatch(pause());
  const onPlay = () => dispatch(play());
  const onPrevious = () => dispatch(previous());
  const sound = useSelector((state: RootState) => state.player.current);
  const currentTime = useSelector(
    (state: RootState) => state.player.currentTime
  );
  const playing = useSelector((state: RootState) => state.player.playing);
  const classes = useStyles();
  return sound ? (
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
              aria-label={playing ? "Pause" : "Play"}
              onClick={playing ? onPause : onPlay}
            >
              {playing ? (
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
              {renderDuration(currentTime || 0, sound.duration || 0)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </footer>
  ) : (
    <></>
  );
}
