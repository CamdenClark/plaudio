import React, { useContext, useState } from "react";
import { AuthContext } from "../components/User";
import {
  Container,
  Grid,
  Button,
  TextField,
  Typography,
} from "@material-ui/core";
import { FirebaseContext } from "../components/Firebase";

import { useHistory } from "react-router-dom";

export const ProfilePage = () => {
  const firebase = useContext(FirebaseContext);
  const auth = useContext(AuthContext);
  const [name, setName] = useState("");
  const history = useHistory();

  return (
    <Container>
      <Grid container direction="row" justify="center">
        <Grid
          container
          item
          xs={12}
          sm={6}
          md={4}
          direction="column"
          justify="center"
          style={{ marginTop: 40 }}
        >
          {auth.user && !auth.user.name && (
            <Grid
              container
              item
              direction="row"
              justify="space-between"
              alignItems={"center"}
              style={{ marginBottom: 50 }}
            >
              <Grid item xs={12} sm={6}>
                <TextField
                  id={"Name"}
                  label={"Name"}
                  variant={"outlined"}
                  style={{ minWidth: 100 }}
                  onChange={(e) => setName(e.target.value || "")}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Button
                  variant={"outlined"}
                  onClick={() => {
                    auth.api.updateProfile({ name }).then(() => {
                      history.push(`/`);
                    });
                  }}
                >
                  Set Display Name
                </Button>
              </Grid>
            </Grid>
          )}
          {auth.user && auth.user.name && (
            <Typography>Display name: {auth.user.name}</Typography>
          )}
          {auth.user && auth.user.email && (
            <Typography>Email: {auth.user.email}</Typography>
          )}
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
      </Grid>
    </Container>
  );
};
