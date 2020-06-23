import React from "react";
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
  sound: Sound;
  onVote: (vote: number) => Promise<void>;
};

export function PlayerPage({ onVote, sound }: PlayerPageProps) {
  const classes = useStyles();
  console.log(sound);
  return (
    <Container className={classes.main}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} sm={9} md={6}>
          <Card>
            <CardContent>
              <Typography style={{ fontSize: "0.9rem" }}>
                from user {sound.userId}
              </Typography>
              <Typography
                style={{ fontSize: "1.8rem", textOverflow: "ellipsis" }}
              >
                {sound.text}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton
                aria-label={
                  sound.userVote === -1 ? "Remove downvote" : "Downvote"
                }
                onClick={() => {
                  sound.userVote === -1 ? onVote(0) : onVote(-1);
                }}
              >
                <ThumbDown
                  className={
                    sound.userVote === -1
                      ? classes.downvoteActive
                      : classes.vote
                  }
                />
              </IconButton>
              {sound.score + (sound.userVote || 0)}
              <IconButton
                aria-label={sound.userVote === 1 ? "Remove upvote" : "Upvote"}
                onClick={() => {
                  sound.userVote === 1 ? onVote(0) : onVote(1);
                }}
              >
                <ThumbUp
                  className={
                    sound.userVote === 1 ? classes.upvoteActive : classes.vote
                  }
                />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
