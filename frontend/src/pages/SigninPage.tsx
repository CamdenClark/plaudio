import React from "react";
import Signin from "../components/Auth/Signin";

import {
  Container,
  Grid,
  Link,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  signupLink: { marginTop: "2rem" },
}));

export const SigninPage = () => {
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
          <Signin />
          <Typography className={classes.signupLink}>
            <Link component={RouterLink} to={`/signup`}>
              Don't have an account yet?
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};
