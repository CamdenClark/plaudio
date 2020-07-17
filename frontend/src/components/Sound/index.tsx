import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Sound } from "../../models/Sound";

import { AuthContext } from "../User";

type SoundCardProps = {
  sound: Sound;
};

const useStyles = makeStyles((theme) => ({
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
  );
}
