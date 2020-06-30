import React from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";

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

  const { email, password } = state;

  return (
    <FirebaseContext.Consumer>
      {(firebase) => {
        return (
          <>
            <TextField
              id={"Email"}
              label={"Email"}
              variant={"outlined"}
              style={{ minWidth: 100 }}
              onChange={(e) =>
                setState({ ...state, email: e.target.value || "" })
              }
            />
            <TextField
              id={"Password"}
              label={"Password"}
              variant={"outlined"}
              style={{ minWidth: 100, marginTop: 20 }}
              onChange={(e) =>
                setState({ ...state, password: e.target.value || "" })
              }
            />
            <Button
              onClick={() => {
                firebase?.doCreateUserWithEmailAndPassword(email, password);
              }}
              variant={"outlined"}
              className={classes.signinButton}
            >
              Sign In
            </Button>
          </>
        );
      }}
    </FirebaseContext.Consumer>
  );
};

export default Signin;
