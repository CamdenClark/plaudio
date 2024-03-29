import React from "react";
import Signup from "../components/Auth/Signup";

import { Container, Grid, Link, Typography } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  signinLink: { marginTop: "2rem" },
}));

export const SignupPage = () => {
  const classes = useStyles();

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
          <Signup />
          <Typography className={classes.signinLink}>
            <Link component={RouterLink} to={`/signin`}>
              Already have an account?
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};
