import React, { useRef, useState } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Typography from "@material-ui/core/Typography";

import { Bite, searchBites } from "@plaudio/common/dist/models/Bite";
import { AddCircle } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  row: {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));
const BiteRow = ({ addBite, bite, onPlay }: any) => {
  const classes = useStyles();
  return (
    <Grid
      container
      item
      direction="row"
      alignItems="center"
      className={classes.row}
    >
      <Grid item xs={8}>
        <Typography>{bite.name}</Typography>
      </Grid>
      <Grid item xs={2}>
        <IconButton onClick={() => onPlay(bite)}>
          <PlayArrow />
        </IconButton>
      </Grid>
      <Grid item xs={2}>
        <IconButton onClick={() => addBite(bite.name)}>
          <AddCircle />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export const BitesModal = ({ addBite, handleClose, open }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = searchBites(searchTerm);

  const player = useRef<HTMLAudioElement | null>(null);
  const onPlay = (bite: Bite) => {
    if (player.current) {
      player.current.src = bite.url;
      player.current.play();
    }
  };

  return (
    <Dialog
      aria-labelledby="bite-dialog-title"
      fullWidth
      open={open}
      onClose={handleClose}
    >
      <audio ref={player} />

      <DialogTitle id="bite-dialog-title">Add a sound bite</DialogTitle>
      <DialogContent>
        <TextField
          id="bite-search"
          label="Search for bites"
          autoFocus
          onChange={(event) => setSearchTerm(event.target.value || "")}
          style={{ marginBottom: 10 }}
        />
        <Grid container>
          {searchResults.map((bite) => (
            <BiteRow bite={bite} onPlay={onPlay} addBite={addBite} />
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
