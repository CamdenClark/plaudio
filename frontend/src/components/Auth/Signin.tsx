import React, { useContext, useEffect, useState } from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { SnackbarContext } from "../Snackbar";

const useStyles = makeStyles((theme) => ({
  signinButton: {
    marginTop: "1rem",
  },
}));

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const classes = useStyles();
  const firebase = useContext(FirebaseContext);
  const history = useHistory();
  const snackbar = useContext(SnackbarContext);

  const login = (email: string, password: string) => {
    firebase
      ?.doSignInWithEmailAndPassword(email, password)
      .then((user) => {
        snackbar.setSnackbar({ message: "Successfully signed in" });
        if (user) {
          history.push(`/`);
        }
      })
      .catch((err) => {
        snackbar.setSnackbar({
          message: "Something went wrong signing you in",
          severity: "error",
        });
      });
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        login(email, password);
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  });

  return (
    <>
      <TextField
        id={"Email"}
        label={"Email"}
        variant={"outlined"}
        style={{ minWidth: 100 }}
        onChange={(e) => setEmail(e.target.value || "")}
      />
      <TextField
        id={"Password"}
        label={"Password"}
        variant={"outlined"}
        type={"password"}
        style={{ minWidth: 100, marginTop: 20 }}
        onChange={(e) => setPassword(e.target.value || "")}
      />
      <Button
        onClick={() => login(email, password)}
        color="primary"
        variant="contained"
        className={classes.signinButton}
      >
        Sign In
      </Button>
    </>
  );
};

export default Signin;
