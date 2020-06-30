import React from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  signupButton: {
    marginTop: "1rem",
  },
}));

const Signup = () => {
  const classes = useStyles();

  const [state, setState] = React.useState({
    email: "",
    password: "",
    confirm: "",
  });

  const { confirm, email, password } = state;

  const passwordInvalid = password !== confirm;

  return (
    <FirebaseContext.Consumer>
      {(firebase) => {
        return (
          <>
            <TextField
              aria-label={"Email"}
              label={"Email"}
              variant={"outlined"}
              style={{ minWidth: 100 }}
              onChange={(e) =>
                setState({ ...state, email: e.target.value || "" })
              }
            />
            <TextField
              aria-describedby={"Password"}
              label={"Password"}
              variant={"outlined"}
              style={{ minWidth: 100, marginTop: 20 }}
              onChange={(e) =>
                setState({ ...state, password: e.target.value || "" })
              }
            />
            <TextField
              aria-describedby={"Confirm Password"}
              label={"Confirm Password"}
              variant={"outlined"}
              style={{ minWidth: 100, marginTop: 20 }}
              error={passwordInvalid}
              helperText={passwordInvalid && "Passwords don't match"}
              onChange={(e) =>
                setState({ ...state, confirm: e.target.value || "" })
              }
            />
            <Button
              onClick={() => {
                firebase?.doCreateUserWithEmailAndPassword(email, password);
              }}
              variant={"outlined"}
              className={classes.signupButton}
            >
              Signup
            </Button>
          </>
        );
      }}
    </FirebaseContext.Consumer>
  );
};

export default Signup;
