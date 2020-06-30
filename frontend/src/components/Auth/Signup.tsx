import React, { useContext } from "react";

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

  const [state, setState] = React.useState({
    email: "",
    password: "",
    confirm: "",
  });

  const { confirm, email, password } = state;

  const passwordInvalid = password !== confirm;

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
        type="password"
        variant={"outlined"}
        style={{ minWidth: 100, marginTop: 20 }}
        onChange={(e) => setState({ ...state, password: e.target.value || "" })}
      />
      <TextField
        id={"Confirm Password"}
        label={"Confirm Password"}
        variant={"outlined"}
        type="password"
        style={{ minWidth: 100, marginTop: 20 }}
        error={passwordInvalid}
        helperText={passwordInvalid && "Passwords don't match"}
        onChange={(e) => setState({ ...state, confirm: e.target.value || "" })}
      />
      <Button
        onClick={() => {
          firebase
            ?.doCreateUserWithEmailAndPassword(email, password)
            .then((authUser) => {
              history.push(`/`);
            });
        }}
        variant={"outlined"}
        className={classes.signupButton}
      >
        Signup
      </Button>
    </>
  );
};

export default Signup;
