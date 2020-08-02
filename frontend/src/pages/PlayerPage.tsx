import React, { useContext, useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { AudioServiceContext } from "../components/Audio";
import { SoundCard } from "../components/Sound";

import { useHistory } from "react-router-dom";
import { Sound } from "@plaudio/common";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export function PlayerPage() {
  const classes = useStyles();
  const history = useHistory();
  const { loadSounds, sound, queue } = useContext(AudioServiceContext);

  useEffect(() => {
    if (!sound) {
      if (history.location.pathname === "/") {
        loadSounds(false);
      } else {
        loadSounds(false, history.location.pathname.substr(1));
      }
    } else {
      history.push(`/${sound.soundId}`);
    }
  }, [sound, history, loadSounds]);

  return (
    <Container className={classes.main}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={11}>
          {queue.map(
            (listSound: Sound, i: number) =>
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
