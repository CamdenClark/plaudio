import React, { useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
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
  loadSounds: (options?: { soundId?: string; next?: boolean }) => void;
  sound: Sound | null;
  queue: Sound[];
  queuePosition: number;
};

export function PlayerPage({
  loadSounds,
  sound,
  queue,
  queuePosition,
}: PlayerPageProps) {
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (!sound) {
      if (history.location.pathname === "/") {
        loadSounds();
      } else {
        loadSounds({ soundId: history.location.pathname.substr(1) });
      }
    } else {
      history.push(`/${sound.soundId}`);
    }
  }, [sound, history, loadSounds]);

  return (
    <Container className={classes.main}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={9}>
          {queue.map((sound) => sound && <SoundCard sound={sound} />)}
        </Grid>
      </Grid>
    </Container>
  );
}
