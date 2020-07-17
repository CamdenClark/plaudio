import React, { useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Sound } from "../models/Sound";
import { SoundCard } from "../components/Sound";

import { useHistory } from "react-router-dom";
import { Listen } from "../models/Listen";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  vote: {
    fontSize: "2.5rem",
    color: "inherit",
  },
  upvoteActive: {
    fontSize: "2.5rem",
    color: theme.palette.primary.dark,
  },
  downvoteActive: {
    fontSize: "2.5rem",
    color: theme.palette.secondary.dark,
  },
}));

type PlayerPageProps = {
  listen: Listen | null;
  loadSounds: (options?: { soundId?: string; next?: boolean }) => void;
  onVote: (vote: number) => Promise<void>;
  sound: Sound | null;
  togglePlayPause: () => void;
};

export function PlayerPage({
  listen,
  loadSounds,
  sound,
  onVote,
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
        <Grid item xs={12} sm={9} md={6}>
          {sound && <SoundCard sound={sound} />}
        </Grid>
      </Grid>
    </Container>
  );
}
