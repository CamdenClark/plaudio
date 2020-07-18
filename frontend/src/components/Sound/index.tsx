import React, { useContext, useEffect, useState } from "react";
import { Grid, IconButton, Typography } from "@material-ui/core";
import { ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Sound } from "../../models/Sound";

import { AuthContext } from "../User";

type SoundCardProps = {
  sound: Sound;
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
  conatiner: {
    borderTop: "1px solid " + theme.palette.grey[700],
    padding: theme.spacing(1, 1),
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
  },
}));

export function SoundCard({ sound }: SoundCardProps) {
  const classes = useStyles();
  const auth = useContext(AuthContext);

  const [vote, setVote] = useState(0);
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
      // setVote(1);
    }
  }, [api, sound]);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      className={classes.conatiner}
    >
      <Grid item xs={12} sm={3}>
        <Typography style={{ fontSize: "0.8rem" }}>
          {sound.displayName}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} zeroMinWidth>
        <Typography
          noWrap
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

/*

    <Card>
      <CardContent>
        <Typography style={{ fontSize: "1rem" }}>
          from user {sound.displayName}
        </Typography>
        <Typography style={{ fontSize: "1.6rem", textOverflow: "ellipsis" }}>
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
            className={vote === -1 ? classes.downvoteActive : classes.vote}
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
    */
