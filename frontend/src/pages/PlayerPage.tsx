import React, { useEffect } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Sound } from "../models/Sound";

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

  const vote = listen?.vote ? listen.vote : 0;

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
          {sound && (
            <Card>
              <CardContent>
                <Typography style={{ fontSize: "0.9rem" }}>
                  from user {sound.displayName}
                </Typography>
                <Typography
                  style={{ fontSize: "1.8rem", textOverflow: "ellipsis" }}
                >
                  {sound.text}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  aria-label={vote === -1 ? "Remove downvote" : "Downvote"}
                  onClick={() => {
                    vote === -1 ? onVote(0) : onVote(-1);
                  }}
                >
                  <ThumbDown
                    className={
                      vote === -1 ? classes.downvoteActive : classes.vote
                    }
                  />
                </IconButton>
                <Typography style={{ fontWeight: "bold" }}>
                  {sound.score + (vote || 0)}
                </Typography>
                <IconButton
                  aria-label={vote === 1 ? "Remove upvote" : "Upvote"}
                  onClick={() => {
                    vote === 1 ? onVote(0) : onVote(1);
                  }}
                >
                  <ThumbUp
                    className={vote === 1 ? classes.upvoteActive : classes.vote}
                  />
                </IconButton>
              </CardActions>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
