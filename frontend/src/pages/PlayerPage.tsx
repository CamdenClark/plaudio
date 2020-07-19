import React, { useContext, useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { AudioServiceContext } from "../components/Audio";
import { Sound } from "../models/Sound";
import { SoundCard } from "../components/Sound";

import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

type PlayerPageProps = {
  loadSounds: (next: boolean, soundId?: string) => void;
  sound: Sound | null;
  queue: Sound[];
  queuePosition: number;
};

export function PlayerPage() {
  const classes = useStyles();
  const history = useHistory();
  const { loadSounds, sound, queue, queuePosition } = useContext(
    AudioServiceContext
  );

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
        <Grid item xs={12} sm={9}>
          {queue.map(
            (sound: any, i: number) =>
              sound && <SoundCard sound={sound} active={i === queuePosition} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
