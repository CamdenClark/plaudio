import React, { useContext, useEffect, useState } from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";

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
  const login = (email: string, password: string) => {
    firebase?.doSignInWithEmailAndPassword(email, password).then((user) => {
      if (user) {
        history.push(`/`);
      }
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
        variant={"outlined"}
        className={classes.signinButton}
      >
        Sign In
      </Button>
    </>
  );
};

export default Signin;
