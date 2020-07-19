import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Hidden,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  Error,
  HourglassEmpty,
  MoreVert,
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
    fontSize: "1.3rem",
    color: "inherit",
  },
  upvoteActive: {
    fontSize: "1.3rem",
    color: theme.palette.primary.dark,
  },
  downvoteActive: {
    fontSize: "1.3rem",
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
  const [originalVote, setOriginalVote] = useState(0);
  const [anchorElement, setAnchorElement] = useState<Element | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const onReport = () => {
    if (sound) {
      api.report(sound.soundId).then((_) => {
        handleClose();
      });
    }
  };

  const auth = useContext(AuthContext);
  const { api } = auth;

  const onVote = (newVote: number) => {
    if (sound) {
      api.vote(sound.soundId, newVote).then((_) => {
        setVote(newVote);
      });
    }
  };

  useEffect(() => {
    if (sound) {
      api.getVote(sound.soundId).then((vote) => {
        setOriginalVote(vote.vote);
        setVote(vote.vote);
      });
    }
  }, [api, sound]);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      className={classes.container}
    >
      {active || sound.status !== SoundStatus.Active ? (
        <Grid container item xs={2} sm={1}>
          {sound.status === SoundStatus.Error && <Error />}
          {sound.status === SoundStatus.Processing && <HourglassEmpty />}
          {active && <VolumeUp />}
        </Grid>
      ) : (
        <Hidden xsDown>
          <Grid item sm={1}></Grid>
        </Hidden>
      )}
      <Grid item xs={10} sm={3}>
        <Typography style={{ fontSize: "0.8rem" }}>
          {sound.displayName}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8} zeroMinWidth>
        <Typography
          noWrap={!active}
          style={{
            fontSize: "1.1rem",
            textOverflow: "ellipsis",
          }}
        >
          {sound.text}
        </Typography>
      </Grid>
      <Grid item sm={1} />
      <Grid
        container
        item
        direction="row"
        alignItems="center"
        xs={12}
        justify="flex-start"
      >
        <Grid item sm={1}>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu
            id={`${sound.soundId}-menu`}
            keepMounted
            anchorEl={anchorElement}
            open={Boolean(anchorElement)}
            onClose={handleClose}
          >
            <MenuItem onClick={onReport}>Report</MenuItem>
          </Menu>
        </Grid>
        <Grid container item alignItems="center" xs={6} sm={3}>
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
            {sound.score - (originalVote - vote)}
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
        </Grid>
        <Grid item xs={6} sm={1}>
          <Typography>
            {`${Math.floor(sound.duration / 60)}:${Math.floor(
              sound.duration % 60
            )
              .toString()
              .padStart(2, "0")}`}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
