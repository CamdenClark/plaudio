import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "../User";
import { TextField, Button, Typography, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { SnackbarContext } from "../Snackbar";

const useStyles = makeStyles((theme) => ({
  signupButton: {
    marginTop: "1rem",
  },
  fulfilled: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  unfulfilled: {
    color: theme.palette.grey[600],
    fontWeight: "bold",
  },
  inputs: {
    marginTop: "1rem",
  },
}));

/* *** CONTENT WARNING *** */
const blockedNameMatch = "(nigg|fag)";
/* *** CONTENT WARNING *** */
const onlyCharactersAndSpaces = "^([a-z]|\\s)*$";

const Signup = () => {
  const classes = useStyles();
  const history = useHistory();
  const auth = useContext(AuthContext);
  const snackbar = useContext(SnackbarContext);

  const { api } = auth;

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const lowerDisplayName = displayName.toLocaleLowerCase();

  const usesBlockedNames = lowerDisplayName.match(blockedNameMatch);
  const usesBadCharacters = !lowerDisplayName.match(onlyCharactersAndSpaces);
  const tooShort = lowerDisplayName.length < 3;
  const tooLong = lowerDisplayName.length > 15;

  const invalidName =
    tooLong || tooShort || usesBlockedNames || usesBadCharacters ? true : false;
  const passwordInvalid = password !== confirm;
  const passwordTooShort = password.length < 1;

  const signupDisabled = invalidName || passwordInvalid || passwordTooShort;

  const signup = (name: string, email: string, password: string) => {
    if (signupDisabled) {
      return;
    }
    api
      .signup({ name, email, password })
      .then((user) => {
        snackbar.setSnackbar({
          message: "Successfully signed up, you can now sign in",
          severity: "success",
        });
        setTimeout(() => history.push(`/`), 500);
      })
      .catch((err) => {
        snackbar.setSnackbar({
          message: "Something went wrong while trying to sign up",
          severity: "error",
        });
      });
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        signup(displayName.trim(), email.trim(), password);
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
        id={"DisplayName"}
        label={"Display Name"}
        helperText="Remember, everyone will hear this!"
        variant={"outlined"}
        style={{ minWidth: "70%" }}
        onChange={(e) => setDisplayName(e.target.value || "")}
      />
      <Typography
        className={tooShort ? classes.unfulfilled : classes.fulfilled}
        style={{ marginTop: "1rem" }}
      >
        {tooShort ? "• Under 3 characters" : "• At least 3 characters"}
      </Typography>
      <Typography className={tooLong ? classes.unfulfilled : classes.fulfilled}>
        {tooLong ? "• Over 15 characters" : "• At most 15 characters"}
      </Typography>
      <Typography
        className={usesBadCharacters ? classes.unfulfilled : classes.fulfilled}
      >
        {usesBadCharacters
          ? "• Contains characters that aren't letters or spaces"
          : "• Only letters and spaces"}
      </Typography>
      <TextField
        id={"Email"}
        label={"Email"}
        variant={"outlined"}
        onChange={(e) => setEmail(e.target.value || "")}
        className={classes.inputs}
      />
      <TextField
        id={"Password"}
        label={"Password"}
        type="password"
        variant={"outlined"}
        onChange={(e) => setPassword(e.target.value || "")}
        className={classes.inputs}
      />
      <TextField
        id={"Confirm Password"}
        label={"Confirm Password"}
        variant={"outlined"}
        type="password"
        error={passwordInvalid}
        helperText={passwordInvalid && "Passwords don't match"}
        onChange={(e) => setConfirm(e.target.value || "")}
        className={classes.inputs}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.signupButton}
        onClick={() => signup(displayName.trim(), email.trim(), password)}
        disabled={signupDisabled}
      >
        Signup
      </Button>
    </>
  );
};

export default Signup;
