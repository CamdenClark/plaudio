import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../User";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, Modal, TextField, Typography } from "@material-ui/core";

const modalStyles = makeStyles((theme) => ({
  modal: {
    position: "absolute",
    minWidth: "40%",
    minHeight: "25%",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  fulfilled: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  unfulfilled: {
    color: theme.palette.grey[600],
    fontWeight: "bold",
  },
}));

/* *** CONTENT WARNING *** */
const blockedNameMatch = "(nigg|fag)";
/* *** CONTENT WARNING *** */
const onlyCharactersAndSpaces = "^([a-z]|\\s)*$";

export const DisplayNameModal = ({ onSubmit }: any) => {
  const auth = useContext(AuthContext);
  const classes = modalStyles();
  const [displayName, setDisplayName] = useState("");
  const lowerDisplayName = displayName.toLocaleLowerCase();

  const usesBlockedNames = lowerDisplayName.match(blockedNameMatch);
  const usesBadCharacters = !lowerDisplayName.match(onlyCharactersAndSpaces);
  const tooShort = lowerDisplayName.length < 3;
  const tooLong = lowerDisplayName.length > 15;

  const invalidName =
    tooLong || tooShort || usesBlockedNames || usesBadCharacters ? true : false;

  const submit = (name: string) => {
    onSubmit(name);
    setDisplayName("");
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        submit(displayName);
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  });

  return (
    <Modal open={auth.user && !auth.user.name ? true : false}>
      <div className={classes.modal}>
        <Grid container direction="column">
          <Grid item style={{ marginBottom: 20 }}>
            <Typography variant={"h6"}>Set your display name:</Typography>
          </Grid>
          <Grid
            container
            item
            direction="row"
            justify="space-between"
            alignItems="flex-start"
            style={{ marginBottom: 20 }}
          >
            <Grid item xs={12} sm={8}>
              <TextField
                id={"DisplayName"}
                label={"Display Name"}
                helperText="What do you want to be called?"
                variant={"outlined"}
                style={{ minWidth: "70%" }}
                onChange={(e) => setDisplayName(e.target.value || "")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                size="large"
                variant="contained"
                color="primary"
                disabled={invalidName}
                onClick={() => submit(displayName)}
              >
                Set Display Name
              </Button>
            </Grid>
          </Grid>
          <Typography
            className={tooShort ? classes.unfulfilled : classes.fulfilled}
          >
            {tooShort ? "• Under 3 characters" : "• At least 3 characters"}
          </Typography>
          <Typography
            className={tooLong ? classes.unfulfilled : classes.fulfilled}
          >
            {tooLong ? "• Over 15 characters" : "• At most 15 characters"}
          </Typography>
          <Typography
            className={
              usesBadCharacters ? classes.unfulfilled : classes.fulfilled
            }
          >
            {usesBadCharacters
              ? "• Contains characters that aren't letters or spaces"
              : "• Only letters and spaces"}
          </Typography>
        </Grid>
      </div>
    </Modal>
  );
};
