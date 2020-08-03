import React, { useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SoundCard } from "../components/Sound";

import { useHistory } from "react-router-dom";
import { Sound } from "@plaudio/common";
import { api } from "../sources/API";
import { useDispatch, useSelector } from "react-redux";
import { setQueue } from "../features/player/playerSlice";
import { RootState } from "../store";

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

  const allSounds = [...history, sound, ...queue];

  useEffect(() => {
    const loadSounds = (next: boolean, soundId?: string) => {
      if (soundId) {
        api.loadSound(soundId).then((sound) => {
          const existing = new Set(queue.map((s: Sound) => s.soundId));
          if (!existing.has(sound.soundId)) {
            dispatch(setQueue([sound, ...queue]));
          }
        });
      } else {
        api.loadSounds(0).then((sounds) => {
          const existing = new Set(queue.map((s: Sound) => s.soundId));
          const soundsToInsert = sounds.filter((s) => !existing.has(s.soundId));
          dispatch(setQueue([...queue, ...soundsToInsert]));
        });
      }
    };

    if (!sound) {
      if (browserHistory.location.pathname === "/" || history.length !== 0) {
        loadSounds(false);
      } else {
        loadSounds(false, browserHistory.location.pathname.substr(1));
      }
    } else {
      browserHistory.push(`/${sound.soundId}`);
    }
  }, [browserHistory, dispatch, history, queue, sound]);
  console.log("Render player page");

  return (
    <Container className={classes.main}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={11}>
          {allSounds.map(
            (listSound?: Sound) =>
              listSound && (
                <SoundCard
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
