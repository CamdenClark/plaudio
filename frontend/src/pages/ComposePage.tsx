import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Speaker } from "@material-ui/icons";
import { UserSound } from "../models/Sound";
import { AudioFile } from "../models/AudioFile";
import { AuthContext } from "../components/User";
import { useHistory } from "react-router-dom";

const SpinnerAdornment = () => (
  <CircularProgress style={{ marginLeft: 5 }} size={20} />
);

export function ComposePage() {
  const [text, setText] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const auth = useContext(AuthContext);
  const history = useHistory();

  const { api } = auth;

  const onSubmit = (sound: UserSound) => api.submit(sound);
  React.useEffect(() => {
    if (rawFile) {
      setLoadingFile(true);
      api.upload(rawFile).then((audioFile) => {
        setLoadingFile(false);
        setAudioFile(audioFile);
      });
    }
  }, [api, rawFile]);
  const { user } = auth;

  const submitDisabled = loadingFile;
  return (
    <Container>
      {user && (
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
            <TextField
              helperText="What do you want to say?"
              id={"Text"}
              label={"Text content"}
              multiline
              rows={4}
              variant={"outlined"}
              style={{ minWidth: 300 }}
              onChange={(e) => setText(e.target.value || "")}
            />
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
                variant="contained"
                color="primary"
                disabled={submitDisabled}
                onClick={() => {
                  onSubmit({
                    displayName,
                    text,
                    sourceFile: audioFile?.name,
                  });
                  history.push(`/profile`);
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
    </Container>
  );
}
