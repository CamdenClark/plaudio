import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Grid,
  Button,
  TextField,
  Typography,
} from "@material-ui/core";

import { AuthContext } from "../components/User";
import { FirebaseContext } from "../components/Firebase";
import { SoundCard } from "../components/Sound";

import { Sound } from "@plaudio/common";

import { useHistory } from "react-router-dom";

export const ProfilePage = () => {
  const firebase = useContext(FirebaseContext);
  const auth = useContext(AuthContext);
  const history = useHistory();

  const [sounds, setSounds] = useState([] as Sound[]);

  const { api } = auth;

  useEffect(() => {
    api.loadMySounds().then((snds) => {
      setSounds(snds);
    });
  }, [api]);

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
            {auth.user && auth.user.name && (
              <Typography variant="h4">{auth.user.name}</Typography>
            )}
            {auth.user && auth.user.email && (
              <Typography>Email: {auth.user.email}</Typography>
            )}
          </Grid>
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
          <Grid item xs={12} style={{ marginTop: "1rem" }}>
            {sounds.map((sound) => (
              <SoundCard sound={sound} />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
