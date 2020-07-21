import React, { createContext } from "react";

export type SnackbarAlert = {
  duration: number;
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
};

type SnackbarContextProps = {
  setSnackbar: (alert: Partial<SnackbarAlert>) => void;
};

const SnackbarContext: React.Context<SnackbarContextProps> = createContext<
  SnackbarContextProps
>({ setSnackbar: (_) => {} });

export default SnackbarContext;
