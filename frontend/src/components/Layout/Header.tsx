import React, { useContext } from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Edit, AccountCircle } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import { Link as RouterLink, useHistory } from "react-router-dom";

import { AuthContext } from "../User";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.paper,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  title: {
    flexGrow: 1,
  },
  titleLink: {
    cursor: "pointer",
  },
}));

export const Header = ({ soundId }: { soundId: string | null }) => {
  const classes = useStyles();
  const history = useHistory();
  const auth = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          <Link
            aria-label={"Return home"}
            component={RouterLink}
            to={`/${soundId || ""}`}
            className={classes.titleLink}
            color="inherit"
          >
            plaud.io
          </Link>
        </Typography>
        {auth.loggedIn && (
          <IconButton
            aria-label={"Compose"}
            color={"inherit"}
            onClick={() => history.push("/compose")}
          >
            <Edit />
          </IconButton>
        )}
        <IconButton
          aria-label={auth.loggedIn ? "Profile" : "Sign in"}
          color={"inherit"}
          onClick={() =>
            auth.loggedIn ? history.push("/profile") : history.push("/signin")
          }
        >
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
