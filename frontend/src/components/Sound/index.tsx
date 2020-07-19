import React, { useContext, useEffect, useState } from "react";
import { Grid, Hidden, IconButton, Typography } from "@material-ui/core";
import {
  Error,
  HourglassEmpty,
  VolumeUp,
  ThumbDown,
  ThumbUp,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import { SoundStatus, Sound } from "@plaudio/common";

import { AuthContext } from "../User";

type SoundCardProps = {
  sound: Sound;
  active?: boolean;
};

const useStyles = makeStyles((theme) => ({
  vote: {
    fontSize: "1.5rem",
    color: "inherit",
  },
  upvoteActive: {
    fontSize: "1.5rem",
    color: theme.palette.primary.dark,
  },
  downvoteActive: {
    fontSize: "1.5rem",
    color: theme.palette.secondary.dark,
  },
  container: (props: SoundCardProps) => ({
    borderTop: "1px solid " + theme.palette.grey[700],
    padding: theme.spacing(1, 1),
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
    color: props.active
      ? theme.palette.primary.dark
      : props.sound.status === SoundStatus.Error
      ? theme.palette.secondary.dark
      : props.sound.status === SoundStatus.Processing
      ? theme.palette.grey[600]
      : theme.palette.text.primary,
  }),
}));

export function SoundCard({ active, sound }: SoundCardProps) {
  const classes = useStyles({ active, sound });
  const [vote, setVote] = useState(0);

  const auth = useContext(AuthContext);
  const { api } = auth;

  const onVote = (vote: number) => {
    if (sound) {
      api.vote(sound.soundId, vote).then((_) => {
        setVote(vote);
      });
    }
  };

  useEffect(() => {
    if (sound) {
      api.getVote(sound.soundId).then((vote) => {
        setVote(vote.vote);
      });
    }
  }, [api, sound]);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      className={classes.container}
    >
      <Grid
        container
        item
        xs={12}
        sm={3}
        alignItems="center"
        justify="center"
        direction="row"
      >
        {active || sound.status !== SoundStatus.Active ? (
          <Grid container item xs={1} sm={3}>
            {sound.status === SoundStatus.Error && <Error />}
            {sound.status === SoundStatus.Processing && <HourglassEmpty />}
            {active && <VolumeUp />}
          </Grid>
        ) : (
          <Hidden xsDown>
            <Grid item sm={3}></Grid>
          </Hidden>
        )}
        <Grid item xs={11} sm={9}>
          <Typography style={{ fontSize: "0.8rem" }}>
            {sound.displayName}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} zeroMinWidth>
        <Typography
          noWrap={!active}
          style={{ fontSize: "1.1rem", textOverflow: "ellipsis" }}
        >
          {sound.text}
        </Typography>
      </Grid>
      <Grid
        container
        item
        direction="row"
        alignItems="center"
        xs={12}
        sm={3}
        justify="flex-end"
      >
        <Grid item>
          <IconButton
            aria-label={vote === -1 ? "Remove downvote" : "Downvote"}
            onClick={() => {
              vote === -1 ? onVote(0) : onVote(-1);
            }}
          >
            <ThumbDown
              className={vote === -1 ? classes.downvoteActive : classes.vote}
            />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography style={{ fontWeight: "bold" }}>
            {sound.score + (vote || 0)}
          </Typography>
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
    </Grid>
  );
}
