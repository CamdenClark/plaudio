import React from "react";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { Speaker } from "@material-ui/icons";

type ComposePageState = {
  text: string;
  file: File | null;
};

export function ComposePage() {
  const defaultState: ComposePageState = { text: "", file: null };
  const [state, setState] = React.useState(defaultState);
  return (
    <Container>
      <Grid container direction="row" justify="center">
        <Grid
          container
          item
          xs={12}
          sm={7}
          direction="column"
          justify="center"
          style={{ marginTop: 40 }}
        >
          <TextField
            label={"Name"}
            multiline
            rows={1}
            variant={"outlined"}
            style={{ minWidth: 100 }}
            onChange={(e) => setState({ ...state, text: e.target.value || "" })}
          ></TextField>
          <TextField
            helperText="What do you want to say?"
            label={"Text"}
            multiline
            rows={4}
            variant={"outlined"}
            style={{ minWidth: 300, marginTop: 50 }}
            onChange={(e) => setState({ ...state, text: e.target.value || "" })}
          ></TextField>
          <Grid
            container
            item
            direction="row"
            justify="space-between"
            style={{ marginTop: 15 }}
          >
            <input
              accept="audio/*"
              id="icon-button-file"
              type="file"
              hidden
              onChange={(e) =>
                setState({
                  ...state,
                  file: e.target?.files ? e.target.files[0] : null,
                })
              }
            />
            <label htmlFor="icon-button-file">
              <Button
                size="large"
                variant="outlined"
                color="primary"
                component="span"
                endIcon={<Speaker />}
              >
                Add Audio
              </Button>
            </label>
            <Button
              size="large"
              variant="contained"
              color="primary"
              style={{ alignSelf: "flex-end" }}
            >
              Submit
            </Button>
          </Grid>
          {state.file && (
            <Grid item style={{ marginTop: 15 }}>
              <Typography variant="caption">
                Audio: {state.file?.name}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
