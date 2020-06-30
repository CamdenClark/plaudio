import React, { useContext } from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  signinButton: {
    marginTop: "1rem",
  },
}));

const Signin = () => {
  const [state, setState] = React.useState({
    email: "",
    password: "",
  });
  const classes = useStyles();
  const firebase = useContext(FirebaseContext);
  const history = useHistory();

  const { email, password } = state;

  return (
    <>
      <TextField
        id={"Email"}
        label={"Email"}
        variant={"outlined"}
        style={{ minWidth: 100 }}
        onChange={(e) => setState({ ...state, email: e.target.value || "" })}
      />
      <TextField
        id={"Password"}
        label={"Password"}
        variant={"outlined"}
        type={"password"}
        style={{ minWidth: 100, marginTop: 20 }}
        onChange={(e) => setState({ ...state, password: e.target.value || "" })}
      />
      <Button
        onClick={() => {
          firebase
            ?.doSignInWithEmailAndPassword(email, password)
            .then((user) => {
              if (user) {
                history.push(`/`);
              }
            });
        }}
        variant={"outlined"}
        className={classes.signinButton}
      >
        Sign In
      </Button>
    </>
  );
};

export default Signin;
