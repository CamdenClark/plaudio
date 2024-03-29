import React, { useContext, useEffect, useState } from "react";
import {
  Grid,
  Hidden,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {
  Error,
  HourglassEmpty,
  MoreVert,
  VolumeUp,
  Favorite,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import { useHistory, Link as RouterLink } from "react-router-dom";

import { SoundStatus, Sound } from "@plaudio/common";

import { SnackbarContext } from "../Snackbar";

import { api } from "../../sources/API";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  getFavorite,
  setFavorite,
} from "../../features/favorites/favoriteSlice";

type SoundCardProps = {
  sound: Sound;
  active?: boolean;
  enqueue?: any;
};

const useStyles = makeStyles((theme) => ({
  favorite: {
    fontSize: "1.3rem",
    color: "inherit",
  },
  favoriteActive: {
    fontSize: "1.3rem",
    color: theme.palette.secondary.light,
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

export function SoundCard({ active, enqueue, sound }: SoundCardProps) {
  const classes = useStyles({ active, sound });
  const [anchorElement, setAnchorElement] = useState<Element | null>(null);

  const dispatch = useDispatch();
  const history = useHistory();
  const snackbar = useContext(SnackbarContext);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const user = useSelector((state: RootState) => state.auth.user);

  const favorite = useSelector(
    (state: RootState) => state.favorites[sound.soundId]
  );

  const onReport = () => {
    if (sound) {
      api.report(sound.soundId).then((_) => {
        snackbar.setSnackbar({
          message: "Successfully reported sound",
          severity: "info",
        });
        handleClose();
      });
    }
  };

  const onFavorite = (newScore: number) => {
    if (!user) {
      history.push(`/signin`);
      return;
    }
    if (sound) {
      dispatch(setFavorite(sound.soundId, newScore));
    }
  };

  useEffect(() => {
    if (sound && !favorite?.loaded && user) {
      dispatch(getFavorite(sound.soundId));
    }
  }, [dispatch, favorite, sound, user]);

  const score = favorite?.score || 0;
  const oldScore = favorite?.oldScore || 0;

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      className={classes.container}
      onClick={enqueue}
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
        <Typography style={{ fontSize: "1rem" }}>
          <Link
            color={"inherit"}
            component={RouterLink}
            to={`/users/${sound.displayName.replace(" ", "_")}`}
          >
            {sound.displayName}
          </Link>
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
        <Grid item xs={1} sm={1}>
          <IconButton onClick={handleMenuOpen} size="small" edge="start">
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
          <Typography style={{ fontWeight: "bold" }}>
            {sound.favorites + (score - oldScore)}
          </Typography>
          <IconButton
            aria-label={score === 1 ? "Remove favorite" : "Favorite"}
            onClick={() => {
              score === 1 ? onFavorite(0) : onFavorite(1);
            }}
          >
            <Favorite
              className={
                score === 1 ? classes.favoriteActive : classes.favorite
              }
            />
          </IconButton>
        </Grid>
        <Grid container item xs={5} sm={8} justify="flex-end">
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
