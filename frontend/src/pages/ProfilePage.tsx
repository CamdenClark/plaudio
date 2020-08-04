import React, { useContext, useEffect } from "react";
import { Container, Grid, Button, Typography } from "@material-ui/core";

import { FirebaseContext } from "../components/Firebase";
import { SoundCard } from "../components/Sound";

import { useHistory, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { getUserSounds } from "../features/playlists/playlistSlice";

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const firebase = useContext(FirebaseContext);
  const history = useHistory();
  const { displayName } = useParams();

  const name = displayName ? displayName : user?.name.replace(" ", "_");

  const sounds = useSelector(
    (state: RootState) => name && state.playlists.users[name]?.sounds
  );

  useEffect(() => {
    if (name && !sounds) {
      dispatch(getUserSounds(name));
    }
  }, [dispatch, name, sounds]);

  return (
    <Container>
      <Grid container direction="row" justify="center">
        <Grid
          container
          item
          xs={12}
          sm={11}
          direction="row"
          justify="space-between"
          alignContent="flex-end"
          style={{ marginTop: 40 }}
        >
          <Grid item xs={8}>
            {name && (
              <Typography variant="h4">{name.replace("_", " ")}</Typography>
            )}
            {!displayName && user && user.email && (
              <Typography>Email: {user.email}</Typography>
            )}
          </Grid>
          {!displayName && user && (
            <Grid container item xs={4} justify="flex-end" alignItems="center">
              <Button
                onClick={() => {
                  firebase?.doSignOut();
                  history.push(`/`);
                }}
                variant={"outlined"}
                color={"secondary"}
              >
                Sign Out
              </Button>
            </Grid>
          )}
          <Grid item xs={12} style={{ marginTop: "1rem" }}>
            {sounds &&
              sounds.map((sound) => (
                <SoundCard key={sound.soundId} sound={sound} />
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
