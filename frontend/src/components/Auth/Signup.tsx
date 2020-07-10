import React, { useContext, useEffect, useState } from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  signupButton: {
    marginTop: "1rem",
  },
}));

const Signup = () => {
  const classes = useStyles();
  const history = useHistory();
  const firebase = useContext(FirebaseContext);

  const signup = (email: string, password: string) => {
    firebase
      ?.doCreateUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        setTimeout(() => history.push(`/`), 500);
      });
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordInvalid = password !== confirm;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        !passwordInvalid &&
        (event.code === "Enter" || event.code === "NumpadEnter")
      ) {
        signup(email, password);
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
        type="password"
        variant={"outlined"}
        style={{ minWidth: 100, marginTop: 20 }}
        onChange={(e) => setPassword(e.target.value || "")}
      />
      <TextField
        id={"Confirm Password"}
        label={"Confirm Password"}
        variant={"outlined"}
        type="password"
        style={{ minWidth: 100, marginTop: 20 }}
        error={passwordInvalid}
        helperText={passwordInvalid && "Passwords don't match"}
        onChange={(e) => setConfirm(e.target.value || "")}
      />
      <Button
        variant={"outlined"}
        className={classes.signupButton}
        onClick={() => signup(email, password)}
      >
        Signup
      </Button>
    </>
  );
};

export default Signup;
