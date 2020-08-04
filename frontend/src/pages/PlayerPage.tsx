import React, { useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SoundCard } from "../components/Sound";

import { useHistory } from "react-router-dom";
import { Sound } from "@plaudio/common";
import { useDispatch, useSelector } from "react-redux";
import { getTopSounds, getSound } from "../features/playlists/playlistSlice";
import { RootState } from "../store";
import { setQueue } from "../features/player/playerSlice";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export function PlayerPage() {
  const classes = useStyles();
  const browserHistory = useHistory();
  const sound = useSelector((state: RootState) => state.player.current);
  const queue = useSelector((state: RootState) => state.player.queue);
  const history = useSelector((state: RootState) => state.player.history);
  const dispatch = useDispatch();

  let allSounds;

  if (sound) {
    allSounds = [...history, sound, ...queue];
  } else {
    allSounds = [...history, ...queue];
  }

  const enqueueBySoundId: { [soundId: string]: any } = {};

  for (let i = 0; i < allSounds.length; i++) {
    const history = allSounds.slice(0, i);
    const current = allSounds[i];
    const queue = allSounds.slice(i + 1);
    enqueueBySoundId[current.soundId] = () =>
      dispatch(setQueue({ current, history, queue }));
  }

  useEffect(() => {
    if (!sound && history.length === 0) {
      if (browserHistory.location.pathname === "/") {
        dispatch(getTopSounds(true));
      } else {
        dispatch(getSound(browserHistory.location.pathname.substr(1), true));
      }
    } else {
      if (sound) {
        browserHistory.push(`/${sound.soundId}`);
      }
    }
  }, [browserHistory, dispatch, history, sound]);

  return (
    <Container className={classes.main}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={11}>
          {allSounds.map(
            (listSound?: Sound) =>
              listSound && (
                <SoundCard
                  key={listSound.soundId}
                  enqueue={enqueueBySoundId[listSound.soundId]}
                  sound={listSound}
                  active={listSound.soundId === sound?.soundId}
                />
              )
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
