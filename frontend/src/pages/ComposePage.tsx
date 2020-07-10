import React, { useContext, useState } from "react";
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
import { AuthContext } from "../components/User";
import { useHistory } from "react-router-dom";

type ComposePageProps = {
  onSubmit: (sound: UserSound) => Promise<Sound>;
  api: IAPI;
};

export function ComposePage({ onSubmit, api }: ComposePageProps) {
  const [text, setText] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const auth = useContext(AuthContext);
  const history = useHistory();
  React.useEffect(() => {
    if (rawFile) {
      api.upload(rawFile).then((audioFile) => {
        setAudioFile(audioFile);
      });
    }
  }, [api, rawFile]);
  const { user } = auth;
  return (
    <Container>
      {user && (
        <>
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
                  </Button>
                </label>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  style={{ alignSelf: "flex-end" }}
                  onClick={() => {
                    onSubmit({
                      displayName,
                      text,
                      sourceFile: audioFile?.name,
                    });
                    history.push(`/`);
                  }}
                >
                  Submit
                </Button>
              </Grid>
              {rawFile && (
                <Grid item style={{ marginTop: 15 }}>
                  <Typography variant="caption">
                    Audio: {rawFile.name}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
