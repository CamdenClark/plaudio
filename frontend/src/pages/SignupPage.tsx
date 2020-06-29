import React from "react";
import Signup from "../components/Auth/Signup";

import { Container, Grid } from "@material-ui/core";

export const SignupPage = () => {
  return (
    <Container>
      <Grid container direction="row" justify="center">
        <Grid
          container
          item
          xs={12}
          sm={7}
          direction="column"
          justify="center"
          style={{ marginTop: 40 }}
        >
          <Signup />
        </Grid>
      </Grid>
    </Container>
  );
};
