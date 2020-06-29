import React from "react";

import { FirebaseContext } from "../Firebase";
import { TextField, Button } from "@material-ui/core";

const Signup = () => {
  const [state, setState] = React.useState({ email: "", password: "" });

  return (
    <FirebaseContext.Consumer>
      {(firebase) => {
        return (
          <>
            <TextField
              aria-describedby={"Name"}
              label={"Name"}
              multiline
              rows={1}
              variant={"outlined"}
              style={{ minWidth: 100 }}
              onChange={(e) =>
                setState({ ...state, email: e.target.value || "" })
              }
            ></TextField>
            <TextField
              aria-describedby={"Password"}
              label={"Password"}
              variant={"outlined"}
              style={{ minWidth: 100, marginTop: 20 }}
              onChange={(e) =>
                setState({ ...state, password: e.target.value || "" })
              }
            ></TextField>
            <Button
              onClick={() => {
                firebase?.doCreateUserWithEmailAndPassword(
                  state.email,
                  state.password
                );
              }}
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
