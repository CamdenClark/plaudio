import React from "react";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { Speaker } from "@material-ui/icons";
import { UserSound, Sound } from "../models/Sound";
import { IAPI } from "../sources/API";
import { AudioFile } from "../models/AudioFile";

type ComposePageState = {
  text: string;
  userId: string;
  rawFile: File | null;
  audioFile?: AudioFile;
};

type ComposePageProps = {
  onSubmit: (sound: UserSound) => Promise<Sound>;
  api: IAPI;
};

export function ComposePage({ onSubmit, api }: ComposePageProps) {
  const defaultState: ComposePageState = {
    text: "",
    rawFile: null,
    userId: "",
  };
  const [state, setState] = React.useState(defaultState);
  const { userId, text, rawFile, audioFile } = state;
  React.useEffect(() => {
    if (rawFile) {
      api.upload(rawFile).then((audioFile) => {
        setState((state) => ({ ...state, audioFile }));
      });
    }
  }, [api, rawFile]);
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
            aria-describedby={"Name"}
            label={"Name"}
            multiline
            rows={1}
            variant={"outlined"}
            style={{ minWidth: 100 }}
            onChange={(e) =>
              setState({ ...state, userId: e.target.value || "" })
            }
          ></TextField>
          <TextField
            helperText="What do you want to say?"
            aria-describedby={"Sound text"}
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
                  rawFile: e.target?.files ? e.target.files[0] : null,
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
              onClick={() =>
                onSubmit({ userId, text, sourceFile: audioFile?.name })
              }
            >
              Submit
            </Button>
          </Grid>
          {rawFile && (
            <Grid item style={{ marginTop: 15 }}>
              <Typography variant="caption">Audio: {rawFile.name}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
