import React, { useContext } from "react";
import { AuthContext } from "../components/User";
import { Container, Grid, Button } from "@material-ui/core";
import { FirebaseContext } from "../components/Firebase";

import { useHistory } from "react-router-dom";

export const ProfilePage = () => {
  const firebase = useContext(FirebaseContext);
  const auth = useContext(AuthContext);
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
          {auth && auth.user && auth.user.email}
          <Button
            onClick={() => {
              firebase?.doSignOut();
              history.push(`/`);
            }}
            variant={"outlined"}
          >
            Sign Out
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};
