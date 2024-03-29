import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Speaker, Audiotrack } from "@material-ui/icons";
import { UserSound } from "../models/Sound";
import { AudioFile } from "../models/AudioFile";
import { BitesModal } from "../components/Bites";
import { SnackbarContext } from "../components/Snackbar";
import { api } from "../sources/API";

import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { RootState } from "../store";

const SpinnerAdornment = () => (
  <CircularProgress style={{ marginLeft: 5 }} size={20} />
);

const onlyCharactersAndSpaces = `^([a-zA-Z]|\\s|\\d|\\?|\\.|\\,|\\!|\\'|\\")*$`;

export function ComposePage() {
  const [text, setText] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [soundBiteModalOpen, setSoundBiteModalOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const snackbar = useContext(SnackbarContext);
  const history = useHistory();

  const onSubmit = (sound: UserSound) =>
    api
      .submit(sound)
      .then((sound) => {
        snackbar.setSnackbar({
          message: `Successfully created sound ${sound.soundId}`,
          severity: "success",
        });
        history.push(`/profile`);
      })
      .catch((err) => {
        snackbar.setSnackbar({
          message: `${err.response ? err.response.data : err}`,
          severity: "error",
        });
      });
  React.useEffect(() => {
    if (rawFile) {
      setLoadingFile(true);
      api.upload(rawFile).then((audioFile) => {
        setLoadingFile(false);
        setAudioFile(audioFile);
      });
    }
  }, [rawFile]);

  const tooLong = text.length > 500;
  const tooShort = text.length < 1;
  const noInvalidCharacters = !text.match(onlyCharactersAndSpaces);

  const submitDisabled =
    tooShort || tooLong || loadingFile || noInvalidCharacters;
  return (
    <Container>
      {user && (
        <Grid container direction="row" justify="center">
          <Grid
            container
            item
            xs={12}
            sm={7}
            direction="row"
            justify="center"
            alignItems="center"
            style={{ marginTop: 40 }}
          >
            {user.admin && (
              <TextField
                id={"Name"}
                label={"Name"}
                multiline
                rows={1}
                variant={"outlined"}
                style={{ minWidth: 100, marginBottom: 50 }}
                onChange={(e) => setDisplayName(e.target.value || "")}
              />
            )}
            <Grid container item xs={12} justify="center">
              <TextField
                helperText={`Allowed characters are letters, numbers, ", ', !, ., !, ?`}
                id={"Text"}
                label={"Text to speak"}
                multiline
                rows={4}
                variant={"outlined"}
                style={{ width: "100%" }}
                onChange={(e) => setText(e.target.value || "")}
                value={text}
              />
            </Grid>
            <Grid container item xs={12} justify="flex-end">
              <Typography color={text.length > 500 ? "secondary" : "inherit"}>
                {text.length}/{500}
              </Typography>
            </Grid>
            <Grid
              container
              item
              direction="row"
              justify="space-between"
              style={{ marginTop: 15 }}
            >
              <Grid item>
                <input
                  accept="audio/*"
                  id="icon-button-file"
                  type="file"
                  hidden
                  onChange={(e) =>
                    setRawFile(e.target?.files ? e.target.files[0] : null)
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
                    {loadingFile && <SpinnerAdornment />}
                  </Button>
                </label>
                <Button
                  size="large"
                  variant="outlined"
                  color="primary"
                  component="span"
                  onClick={() => setSoundBiteModalOpen(true)}
                  endIcon={<Audiotrack />}
                >
                  Add Bite
                </Button>
              </Grid>
              <Button
                size="large"
                variant="contained"
                color="primary"
                disabled={submitDisabled}
                onClick={() => {
                  onSubmit({
                    displayName,
                    text,
                    sourceFile: audioFile?.name,
                  });
                }}
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
      )}
      <BitesModal
        addBite={(biteText: string) => setText(text + ` ${biteText}`)}
        open={soundBiteModalOpen}
        handleClose={() => setSoundBiteModalOpen(false)}
      />
    </Container>
  );
}
