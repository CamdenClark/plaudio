import React, { useState, useCallback } from "react";

import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";
import SnackbarContext, { SnackbarAlert } from "./context";

const Alert = (props: any) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const defaultAlert = {
  message: "",
  open: false,
  duration: 6000,
  severity: "success",
};

export const SnackbarProvider = (props: any) => {
  const [alert, setAlert] = useState(defaultAlert);

  const { duration, message, open, severity } = alert;
  const onClose = () => {
    setAlert({ ...alert, open: false });
  };

  const setSnackbar = useCallback(
    (newAlert: Partial<SnackbarAlert>) => {
      console.log(newAlert);
      setAlert({
        ...defaultAlert,
        open: true,
        ...newAlert,
      });
    },
    [setAlert]
  );

  return (
    <SnackbarContext.Provider value={{ setSnackbar }}>
      {props.children}
      <Snackbar
        open={open}
        onClose={onClose}
        autoHideDuration={duration}
        style={{ marginBottom: "10%" }}
      >
        <Alert severity={severity} onClose={onClose}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
